import {
  addChat,
  addMessage,
  clearChat,
  deleteChat,
  deleteMessage,
  getChat,
  getChatMessages,
  getPreviousChats,
  getRecentChatMessages,
  updateChat,
  updateMessage,
} from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import { getNotesForDay } from "@/database/notes";
import { getTasksForDay } from "@/database/tasks";
import {
  eveningReflectionPersona,
  formatChatHistory,
  formatDailyContext,
  morningIntentionPersona,
  summarizeChatPersona,
  taskExtractionPersona,
  yearEndReflectionPersona,
} from "@/lib/systemMessages";
import type { CoreMessage } from "ai";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAIProviderStore } from "./aiProviderStore";
import { useTemplateStore } from "./templateStore";
import { useSettingsStore } from "./settingsStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { format } from "date-fns";

export type ThrottleSpeed = "fast" | "medium" | "slow";

export interface ChatStore {
  addChat: (chat: Chat) => Promise<number>;
  startSession: (chatId: number) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  sendChatMessage: (chatId: number, input: string) => Promise<void>;
  generateChatTitle: (chatId: number) => Promise<void>;
  extractTasks: (chatId: number) => Promise<string[] | undefined>;
  summarizeChat: (chatId: number) => Promise<void>;
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
  throttleSpeed: ThrottleSpeed;
  setThrottleSpeed: (value: ThrottleSpeed) => void;
  stopReply: () => void;
  abortController: AbortController | null;
  setAbortController: (controller: AbortController | null) => void;
  deleteMessage: (messageId: number) => Promise<void>;
  viewMode: "calendar" | "all";
  setViewMode: (mode: "calendar" | "all") => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  useCmdEnterToSend: boolean;
  setUseCmdEnterToSend: (value: boolean) => void;
  isEditTitleDialogOpen: boolean;
  setEditTitleDialogOpen: (isOpen: boolean) => void;
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
  useAIMemory: boolean;
  setUseAIMemory: (value: boolean) => void;
  contextWindowSize: number;
  setContextWindowSize: (value: number) => void;
  userBio: string;
  setUserBio: (bio: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        const templateStore = useTemplateStore.getState();
        const { selectedLanguage } = useSettingsStore.getState();
        const { activeModel, getModelProvider } = useAIProviderStore.getState();
        let persona = "";

        if (chat.type === "morning") {
          persona = morningIntentionPersona;
        } else if (chat.type === "evening") {
          persona = eveningReflectionPersona;
        } else if (chat.type === "year-end") {
          persona = yearEndReflectionPersona;
        } else {
          persona =
            templateStore.templates.find(
              (t) => t.type === "generic" && t.isActive,
            )?.content || "";
        }

        persona = `${persona}\n\nALWAYS reply in ${selectedLanguage} regardless of the language of the user's message or language of other instructions.`;

        // Use the active model from aiProviderStore
        if (!activeModel) {
          throw new Error(
            "No active model selected. Please select a model in settings.",
          );
        }

        const provider = getModelProvider(activeModel);
        if (!provider) {
          throw new Error("Could not determine provider for the active model.");
        }

        const chatId = await addChat({
          ...chat,
          model: activeModel,
          provider,
        });

        // Add system message with base persona
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

        let chatType = "";
        switch (chat.type) {
          case "morning":
            chatType = "Morning Intention";
            break;
          case "evening":
            chatType = "Evening Reflection";
            break;
          case "year-end":
            chatType = "End of Year Reflection";
            break;
        }

        const startMessage = `Let's start our ${chatType} session.`;

        get().sendChatMessage(chatId, startMessage);
      },
      selectedDate: format(new Date(), "yyyy-MM-dd"),
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },
      sendChatMessage: async (chatId: number, input: string) => {
        const abortController = new AbortController();
        get().setAbortController(abortController);

        let assistantMessageId: number | null = null;

        try {
          let chat = await getChat(chatId);
          if (!chat) throw new Error("Chat not found");

          const aiProvider = useAIProviderStore.getState();
          const isModelAvailable = aiProvider.isModelAvailable(chat.model);

          if (!isModelAvailable) {
            const activeModel = aiProvider.activeModel;
            if (!activeModel) return;
            const activeModelAvailable =
              aiProvider.isModelAvailable(activeModel);
            if (activeModelAvailable) {
              await updateChat(chatId, { model: activeModel });
              chat = await getChat(chatId);
            } else {
              return;
            }
          }

          if (!chat) throw new Error("Chat not found");

          // Add the user message to the database
          const userMessage: Message = {
            chatId,
            role: "user",
            text: input,
          };
          get().setReplyLoading(true);
          await addMessage(userMessage);
          let assistantContent = "";

          // Create assistant message placeholder
          assistantMessageId = await addMessage({
            chatId,
            role: "assistant",
            text: assistantContent,
          });

          // Get all messages for the chat
          const messages = await getChatMessages(chatId);
          const activeModel = chat.model;

          // Create the message array for the AI with injected context
          const messagesForAI: CoreMessage[] = [
            // First the system message
            ...messages
              .filter((m) => m.role === "system")
              .map((m) => ({ role: m.role, content: m.text })),
          ];

          // Get and format current context
          const recentChats = (await getPreviousChats(5, chatId)).filter(
            (c) => c.id !== chatId,
          );
          const recentMessages = await Promise.all(
            recentChats.map(async (c) => await getRecentChatMessages(c.id!)),
          ).then((msgs) => msgs.flat());
          const tasks = await getTasksForDay(chat.dateString);
          const notes = await getNotesForDay(chat.dateString);

          const chatHistory = formatChatHistory(recentChats, recentMessages);
          const dailyContext = formatDailyContext(
            tasks,
            notes,
            chat.dateString,
          );

          // Add user bio if present
          if (get().userBio.trim()) {
            messagesForAI.push({
              role: "user",
              content: `Please keep in mind the following information about me when responding:\n\n${get().userBio}`,
            });
            messagesForAI.push({
              role: "assistant",
              content: "I understand. Let's proceed.",
            });
          }

          // Only add context if we have any and AI memory is enabled
          if ((dailyContext || chatHistory) && get().useAIMemory) {
            interface ChatContext {
              dateToday: string;
              dailyContext?: any;
              chatHistory?: any;
            }

            const chatContext: ChatContext = {
              dateToday: chat.dateString,
            };

            if (dailyContext) {
              chatContext.dailyContext = JSON.parse(dailyContext);
            }

            if (chatHistory) {
              chatContext.chatHistory = JSON.parse(chatHistory);
            }

            // Add context message
            messagesForAI.push({
              role: "user",
              content: `Here is the current context of other recent chats we've had. You should be aware of this context when responding. Keep in my mind today's date and the dates of the previous chats: ${JSON.stringify(chatContext, null, 2)}`,
            });

            // Add acknowledgment
            messagesForAI.push({
              role: "assistant",
              content:
                "I understand the context. I will focus on our current conversation and only refer to the context when it is relevant to this conversation. Let's proceed.",
            });
          }

          // Then add all non-system messages
          messagesForAI.push(
            ...messages
              .filter((m) => m.role !== "system")
              .filter((m) => m.text.trim().length > 0)
              .map((m) => ({ role: m.role, content: m.text })),
          );

          const stream = aiProvider.streamChat(messagesForAI, activeModel);

          for await (const chunk of stream) {
            if (abortController.signal.aborted) {
              break;
            }
            const content = chunk || "";
            assistantContent += content;
            await updateMessage(assistantMessageId as number, {
              text: assistantContent,
            });
          }

          if (!abortController.signal.aborted) {
            // Ensure the final content is updated
            await updateMessage(assistantMessageId as number, {
              text: assistantContent,
            });
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("AbortError");
            // Ensure we break out of the character display loop
            abortController.abort();
            return;
          }
          console.error("Error in chat:", error);
          await updateMessage(assistantMessageId as number, {
            text: `${error instanceof Error ? error.message : "An unknown error occurred"}`,
          });
        } finally {
          get().setReplyLoading(false);
          get().setAbortController(null);
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

        const aiProvider = useAIProviderStore.getState();

        const response = await aiProvider.generateText(
          [
            {
              role: "system",
              content:
                "You are a helpful assistant. You are given a chat and you need to generate a title for it. The title should be a single sentence that captures the essence of the chat. It should not be more than 10 words and not include Markdown styling.",
            },
            ...messages
              .filter((m) => m.role !== "system")
              .map((m) => ({ role: m.role, content: m.text })),
            {
              role: "user",
              content:
                "Generate a title for this chat and return it as a string. The title should be a single sentence that captures the essence of the chat. It should not be more than 10 words and not include Markdown styling.",
            },
          ],
          chat.model,
        );

        const title = response.text || "";
        await updateChat(chatId, { title });
      },
      extractTasks: async (chatId: number) => {
        const chat = await getChat(chatId);
        const selectedDate = get().selectedDate;
        if (!chat || !selectedDate) throw new Error("Chat or date not found");

        const tasks = await getTasksForDay(selectedDate);
        const existingMessages = await getChatMessages(chatId);

        const existingTasks = tasks.map((t) => t.text).join("\n");
        const chatContent = existingMessages.map((m) => m.text).join("\n");

        const aiProvider = useAIProviderStore.getState();

        const response = await aiProvider.generateText(
          [
            {
              role: "system",
              content: taskExtractionPersona(existingTasks, chatContent),
            },
            ...existingMessages
              .slice(1)
              .map((m) => ({ role: m.role, content: m.text })),
            {
              role: "user",
              content:
                "Extract the tasks from the conversation and return them as a JSON array. Do not return anything else. Your response should start with [ and end with ].",
            },
          ],
          chat.model,
        );

        try {
          let content = response.text || "[]";
          // Extract everything between the first [ and last ]
          const match = content.match(/\[([\s\S]*)\]/);
          if (match) {
            content = `[${match[1]}]`;
          }
          console.log("Extracted tasks:", content);
          const tasks = JSON.parse(content);
          return tasks;
        } catch (error) {
          console.error("Error parsing extracted tasks response:", error);
        }
      },
      summarizeChat: async (chatId: number) => {
        const chat = await getChat(chatId);
        if (!chat) throw new Error("Chat not found");

        const messages = await getChatMessages(chatId);
        if (messages.length < 2) return;

        let model = chat.model;
        const aiProvider = useAIProviderStore.getState();
        const isModelAvailable = aiProvider.isModelAvailable(model);

        if (!isModelAvailable) {
          model = aiProvider.activeModel || "";
        }

        if (!model) return;

        const conversations = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.text }));

        const messagesForAI = [
          {
            role: "system",
            content: summarizeChatPersona,
          },
          {
            role: "user",
            content: `Here is the conversation we had in JSON, summarize it as instructed: ${JSON.stringify(
              conversations,
              null,
              2,
            )}.`,
          },
        ] as CoreMessage[];

        console.log(messagesForAI);

        const response = await aiProvider.generateText(messagesForAI, model);

        console.log(response);

        try {
          const summary = response.text;
          console.log("Summary response:", summary);
          await updateChat(chatId, {
            summary,
            summaryCreatedAt: Date.now(),
          });
        } catch (error) {
          console.error("Error parsing summary response:", error);
        }
      },
      replyLoading: false,
      setReplyLoading: (isLoading: boolean) => set({ replyLoading: isLoading }),
      isNewChatDialogOpen: false,
      setNewChatDialogOpen: (isOpen: boolean) =>
        set({ isNewChatDialogOpen: isOpen }),
      isSidebarVisible: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
      regenerateReply: async (chatId: number) => {
        const messages = await getChatMessages(chatId);
        if (messages.length < 1) return; // No messages to regenerate

        const lastMessage = messages[messages.length - 1];

        if (lastMessage.role === "assistant") {
          // If last message is from assistant, delete both assistant and user messages
          const lastUserMessage = messages[messages.length - 2];
          if (!lastUserMessage || lastUserMessage.role !== "user") return;

          await deleteMessage(lastMessage.id!);
          await deleteMessage(lastUserMessage.id!);
          await get().sendChatMessage(chatId, lastUserMessage.text);
        } else if (lastMessage.role === "user") {
          // If last message is from user, just delete and resend it
          await deleteMessage(lastMessage.id!);
          await get().sendChatMessage(chatId, lastMessage.text);
        }
      },
      isAdvancedSidebarVisible: false,
      toggleAdvancedSidebar: () =>
        set((state) => ({
          isAdvancedSidebarVisible: !state.isAdvancedSidebarVisible,
        })),
      throttleResponse: false,
      setThrottleResponse: (value: boolean) => set({ throttleResponse: value }),
      throttleSpeed: "medium",
      setThrottleSpeed: (value: ThrottleSpeed) => set({ throttleSpeed: value }),
      stopReply: () => {
        const { replyLoading, abortController } = get();
        if (replyLoading) {
          if (abortController) {
            abortController.abort();
          }
          set({ replyLoading: false });
        }
      },
      abortController: null,
      setAbortController: (controller: AbortController | null) =>
        set({ abortController: controller }),
      deleteMessage: async (messageId: number) => {
        await deleteMessage(messageId);
        // Force a re-render by updating a state
        set((state) => ({ ...state }));
      },
      viewMode: "calendar",
      setViewMode: (mode: "calendar" | "all") => set({ viewMode: mode }),
      showSettings: false,
      setShowSettings: (show: boolean) => set({ showSettings: show }),
      useCmdEnterToSend: true,
      setUseCmdEnterToSend: (value: boolean) =>
        set({ useCmdEnterToSend: value }),
      isEditTitleDialogOpen: false,
      setEditTitleDialogOpen: (isOpen: boolean) =>
        set({ isEditTitleDialogOpen: isOpen }),
      activeChatId: null,
      setActiveChatId: (id: number | null) => set({ activeChatId: id }),
      useAIMemory: false,
      setUseAIMemory: (value: boolean) => set({ useAIMemory: value }),
      contextWindowSize: 4096,
      setContextWindowSize: (value: number) =>
        set({ contextWindowSize: value }),
      userBio: "",
      setUserBio: (bio: string) => set({ userBio: bio }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);
