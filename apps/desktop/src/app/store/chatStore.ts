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
import {
  eveningReflectionPersona,
  genericPersona,
  morningIntentionPersona,
  taskExtractionPersona,
} from "@/lib/persona";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getTasksForDay } from "@/database/tasks";

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
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        let persona = genericPersona;

        if (chat.type === "morning") {
          persona = morningIntentionPersona;
        }
        if (chat.type === "evening") {
          persona = eveningReflectionPersona;
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

          const messageId = await addMessage({
            chatId,
            role: "assistant",
            text: assistantContent,
          });


          const messages = await getChatMessages(chatId);
          const activeModel = chat.model; // Use the model from the chat

          const response = await ollama.chat({
            model: activeModel,
            messages: [
              { role: "system", content: "You are a helpful assistant." }, // Replace with your actual persona logic
              ...messages.map((m) => ({ role: m.role, content: m.text })),
              { role: userMessage.role, content: userMessage.text },
            ],
            stream: true,
            options: { num_ctx: 4096 },
          });


          for await (const part of response) {
            assistantContent += part.message.content;
            await updateMessage(messageId, {
              text: assistantContent,
            });
          }
          get().setReplyLoading(false);
        } catch (error) {
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
          //   {
          //   role: "system",
          //   content: taskExtractionPersona(existingTasks, chatContent),
          // },
          ...existingMessages.slice(0).map((m) => ({ role: m.role, content: m.text })),
          // {
          //   role: "user",
          //   content: "Please look at the user and assistant messages and extract the tasks for the user to do today. Look at ALL messages, not just the last one. Only return valid JSON array of tasks as [{ task: 'task description' }]. Do not return any other text, markdown formatting etc.",
          // },
          {
            role: "user",
            content: taskExtractionPersona(existingTasks, chatContent),
          }]

        console.log("Task extraction messages:", messages);

        const response = await ollama.chat({
          model: chat.model,
          messages,
          options: { temperature: 0.8, num_ctx: 4096 },
        });

        console.log("Task extraction response:", response.message.content);

        try {
          const tasks = JSON.parse(response.message.content);
          console.log("Extracted tasks:", tasks);

          return tasks;
        } catch (error) {
          console.error("Error parsing task extraction response:", error);
        }

        // TODO: Process the extracted tasks and add them to the task store
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
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);
