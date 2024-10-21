import {
  addChat,
  addMessage,
  clearChat,
  deleteChat,
  getChat,
  getChatMessages,
  updateChat,
  updateMessage,
  deleteMessage,
} from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import { useTemplateStore } from "./templateStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getTasksForDay } from "@/database/tasks";
import { taskExtractionPersona } from "@/lib/persona";

interface ChatStore {
  addChat: (chat: Chat) => Promise<number>;
  startSession: (chatId: number) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: Date) => void;
  sendChatMessage: (chatId: number, input: string) => Promise<void>;
  generateChatTitle: (chatId: number) => Promise<void>;
  extractTasks: (chatId: number) => Promise<{ task: string }[] | undefined>;
  replyLoading: boolean;
  setReplyLoading: (isLoading: boolean) => void;
  clearChat: (chatId: number) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  isNewChatDialogOpen: boolean;
  setNewChatDialogOpen: (isOpen: boolean) => void;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  regenerateReply: (chatId: number) => Promise<void>;
  isAdvancedSidebarVisible: boolean;
  toggleAdvancedSidebar: () => void;
  throttleResponse: boolean;
  setThrottleResponse: (value: boolean) => void;
  throttleDelay: number;
  setThrottleDelay: (value: number) => void;
  stopReply: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        const templateStore = useTemplateStore.getState();
        let persona = "";

        if (chat.type === "morning") {
          persona = templateStore.templates.find(t => t.type === "morningIntention" && t.isActive)?.content || "";
        } else if (chat.type === "evening") {
          persona = templateStore.templates.find(t => t.type === "eveningReflection" && t.isActive)?.content || "";
        } else {
          persona = templateStore.templates.find(t => t.type === "generic" && t.isActive)?.content || "";
        }

        const chatId = await addChat(chat);
        await addMessage({
          chatId,
          role: "system",
          text: persona,
        });

        return chatId;
      },
      startSession: async (chatId: number) => {
        const chat = await getChat(chatId);
        if (!chat) throw new Error("Chat not found");

        const startMessage = "Let's start our session.";

        get().sendChatMessage(chatId, startMessage);
      },
      selectedDate: null,
      setSelectedDate: (date: Date) => {
        set({ selectedDate: date.toISOString() });
      },
      sendChatMessage: async (chatId: number, input: string) => {
        try {
          const chat = await getChat(chatId);
          if (!chat) throw new Error("Chat not found");

          const userMessage: Message = {
            chatId,
            role: "user",
            text: input,
          };
          get().setReplyLoading(true);
          await addMessage(userMessage);
          let assistantContent = "";
          let displayedContent = "";
          let lastUpdateTime = Date.now();

          const shouldThrottle = get().throttleResponse;
          const throttleDelay = get().throttleDelay;

          const updateCharByChar = async () => {
            if (shouldThrottle) {
              const currentTime = Date.now();
              if (currentTime - lastUpdateTime >= throttleDelay && displayedContent.length < assistantContent.length) {
                displayedContent += assistantContent[displayedContent.length];
                await updateMessage(messageId, {
                  text: displayedContent,
                });
                lastUpdateTime = currentTime;
              }
            } else {
              displayedContent = assistantContent;
              await updateMessage(messageId, {
                text: displayedContent,
              });
            }
          };

          const updateInterval = shouldThrottle ? setInterval(updateCharByChar, throttleDelay) : null;

          const messageId = await addMessage({
            chatId,
            role: "assistant",
            text: assistantContent,
          });

          const messages = await getChatMessages(chatId);
          const activeModel = chat.model;

          // Check if there's already a system message
          const hasSystemMessage = messages.some(m => m.role === "system");

          let systemMessage = "";
          if (!hasSystemMessage) {
            const templateStore = useTemplateStore.getState();
            if (chat.type === "morning") {
              systemMessage = templateStore.templates.find(t => t.type === "morningIntention" && t.isActive)?.content || "";
            } else if (chat.type === "evening") {
              systemMessage = templateStore.templates.find(t => t.type === "eveningReflection" && t.isActive)?.content || "";
            } else {
              systemMessage = templateStore.templates.find(t => t.type === "generic" && t.isActive)?.content || "";
            }

            // Add the system message to the chat if it's not empty
            if (systemMessage) {
              await addMessage({
                chatId,
                role: "system",
                text: systemMessage,
              });
            }
          }

          const response = await ollama.chat({
            model: activeModel,
            messages: [
              ...(systemMessage ? [{ role: "system", content: systemMessage }] : []),
              ...messages.map((m) => ({ role: m.role, content: m.text })),
              { role: userMessage.role, content: userMessage.text },
            ],
            stream: true,
            options: { num_ctx: 4096 },
          });

          for await (const part of response) {
            assistantContent += part.message.content;
            if (!shouldThrottle) {
              await updateCharByChar();
            }
          }

          // Ensure all remaining characters are displayed
          while (shouldThrottle && displayedContent.length < assistantContent.length) {
            await updateCharByChar();
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          if (updateInterval) {
            clearInterval(updateInterval);
          }

          // Ensure the final content is updated
          await updateMessage(messageId, {
            text: assistantContent,
          });

          get().setReplyLoading(false);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error("Error in chat:", error);
          await addMessage({
            chatId,
            role: "assistant",
            text: "An error occurred. Please try again.",
          });
        } finally {
          const messages = await getChatMessages(chatId);
          const chat = await getChat(chatId);
          if (messages.length > 1 && messages.length <= 3 && !chat?.title) {
            await get().generateChatTitle(chatId);
          }
        }
      },
      clearChat: async (chatId: number) => {
        await clearChat(chatId);
      },
      deleteChat: async (chatId: number) => {
        await deleteChat(chatId);
      },
      generateChatTitle: async (chatId: number) => {
        const chat = await getChat(chatId);
        if (!chat) throw new Error("Chat not found");
        const messages = await getChatMessages(chatId);
        const response = await ollama.chat({
          model: chat.model,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            {
              role: "user",
              content:
                "Generate a title for this chat and return it as a string. The title should be a single sentence that captures the essence of the chat. It should not be more than 10 words and not include Markdown styling.",
            },
          ],
        });
        await updateChat(chatId, { title: response.message.content });
      },
      extractTasks: async (chatId: number) => {
        const chat = await getChat(chatId);
        const selectedDate = get().selectedDate;
        if (!chat || !selectedDate) throw new Error("Chat or date not found");
        const tasks = await getTasksForDay(new Date(selectedDate));
        const existingMessages = await getChatMessages(chatId);

        const existingTasks = tasks.map((t) => t.text).join("\n");
        const chatContent = existingMessages.map((m) => m.text).join("\n");

        const messages = [
          {
            role: "system",
            content: taskExtractionPersona(existingTasks, chatContent),
          },
          ...existingMessages.slice(1).map((m) => ({ role: m.role, content: m.text })),
          {
            role: "user",
            content: "Extract the tasks from the conversation and return them as a JSON array. Do not return anything else.",
          },
        ];

        console.log("Extracted tasks messages:", messages);

        const response = await ollama.chat({
          model: chat.model,
          messages,
          options: {
            temperature: 0.8,
            num_ctx: 4096
          },
        });

        console.log("Extracted tasks response:", response.message.content);

        try {
          const tasks = JSON.parse(response.message.content);
          console.log("Extracted tasks:", tasks);
          return tasks;
        } catch (error) {
          console.error("Error parsing extracted tasks response:", error);
        }
      },
      replyLoading: false,
      setReplyLoading: (isLoading: boolean) => set({ replyLoading: isLoading }),
      isNewChatDialogOpen: false,
      setNewChatDialogOpen: (isOpen: boolean) =>
        set({ isNewChatDialogOpen: isOpen }),
      isSidebarVisible: true,
      toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
      regenerateReply: async (chatId: number) => {
        const messages = await getChatMessages(chatId);
        if (messages.length < 2) return; // Not enough messages to regenerate

        const lastAssistantMessage = messages[messages.length - 1];
        const lastUserMessage = messages[messages.length - 2];

        if (lastAssistantMessage.role !== 'assistant' || lastUserMessage.role !== 'user') return;

        // Delete the last assistant message
        await deleteMessage(lastAssistantMessage.id!);

        // Delete the last user message
        await deleteMessage(lastUserMessage.id!);

        // Re-send the user message to get a new reply
        await get().sendChatMessage(chatId, lastUserMessage.text);
      },
      isAdvancedSidebarVisible: false,
      toggleAdvancedSidebar: () => set((state) => ({ isAdvancedSidebarVisible: !state.isAdvancedSidebarVisible })),
      throttleResponse: true,
      setThrottleResponse: (value: boolean) => set({ throttleResponse: value }),
      throttleDelay: 10, // Default delay of 10ms
      setThrottleDelay: (value: number) => set({ throttleDelay: value }),
      stopReply: () => {
        const { replyLoading } = get();
        if (replyLoading) {
          ollama.abort();
          set({ replyLoading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);
