import {
  addChat,
  addMessage,
  clearChat,
  deleteChat,
  deleteMessage,
  getChat,
  getChatMessages,
  updateChat,
  updateMessage,
} from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import { getTasksForDay } from "@/database/tasks";
import { taskExtractionPersona } from "@/lib/persona";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import OpenAI from "openai";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { preInstalledTemplates, useTemplateStore } from "./templateStore";
import * as workerTimers from "worker-timers";
import { useOllamaStore } from "../store";
import { format } from "date-fns";

export type ThrottleSpeed = "fast" | "medium" | "slow";

interface ChatStore {
  addChat: (chat: Chat) => Promise<number>;
  startSession: (chatId: number) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  sendChatMessage: (chatId: number, input: string) => Promise<void>;
  generateChatTitle: (chatId: number) => Promise<void>;
  extractTasks: (chatId: number) => Promise<string[] | undefined>;
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
}

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
  dangerouslyAllowBrowser: true,
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        const templateStore = useTemplateStore.getState();
        const { selectedLanguage } = useOllamaStore.getState();
        let persona = "";

        if (chat.type === "morning") {
          persona =
            templateStore.templates.find(
              (t) => t.type === "morningIntention" && t.isActive,
            )?.content || "";
        } else if (chat.type === "evening") {
          persona =
            templateStore.templates.find(
              (t) => t.type === "eveningReflection" && t.isActive,
            )?.content || "";
        } else if (chat.type === "year-end") {
          persona =
            preInstalledTemplates.find(
              (t) => t.type === "yearEndReflection" && t.isActive,
            )?.content || "";
        } else {
          persona =
            templateStore.templates.find(
              (t) => t.type === "generic" && t.isActive,
            )?.content || "";
        }

        persona = `${persona}\n\nALWAYS reply in ${selectedLanguage} regardless of the language of the user's message or language of other instructions.`;

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
      selectedDate: format(new Date(), "yyyy-MM-dd"),
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },
      sendChatMessage: async (chatId: number, input: string) => {
        const { checkModelExists } = useOllamaStore.getState();
        let updateInterval: number | null = null;
        const abortController = new AbortController();
        get().setAbortController(abortController);

        let assistantMessageId: number | null = null;

        // check if ollama is running first
        const ollamaRunning = await useOllamaStore
          .getState()
          .fetchInstalledModels();
        if (!ollamaRunning) return;

        try {
          let chat = await getChat(chatId);
          if (!chat) throw new Error("Chat not found");

          const exists = await checkModelExists(chat.model);

          if (!exists) {
            const activeModel = useOllamaStore.getState().activeModel;
            if (!activeModel) return;
            const activeModelExists = await checkModelExists(activeModel);
            if (activeModelExists) {
              await updateChat(chatId, { model: activeModel });
              chat = await getChat(chatId);
            } else {
              return;
            }
          }

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

          const shouldThrottle = get().throttleResponse;
          const throttleSpeed = get().throttleSpeed;

          const getThrottleDelay = (speed: ThrottleSpeed): number => {
            switch (speed) {
              case "slow":
                return 20;
              case "medium":
                return 5;
              case "fast":
                return 1;
              default:
                return 1;
            }
          };

          const throttleDelay = getThrottleDelay(throttleSpeed);

          assistantMessageId = await addMessage({
            chatId,
            role: "assistant",
            text: assistantContent,
          });

          const updateCharByChar = async () => {
            if (displayedContent.length < assistantContent.length) {
              displayedContent += assistantContent[displayedContent.length];
              await updateMessage(assistantMessageId as number, {
                text: displayedContent,
              });
            }
          };

          const throttledUpdate = () => {
            if (displayedContent.length < assistantContent.length) {
              updateCharByChar();
            } else if (updateInterval) {
              workerTimers.clearInterval(updateInterval);
              updateInterval = null;
            }
          };

          if (shouldThrottle) {
            updateInterval = workerTimers.setInterval(
              throttledUpdate,
              throttleDelay,
            );
          }

          const messages = await getChatMessages(chatId);
          const activeModel = chat.model;

          // Check if there's already a system message
          const hasSystemMessage = messages.some((m) => m.role === "system");

          let systemMessage = "";
          if (!hasSystemMessage) {
            const templateStore = useTemplateStore.getState();
            if (chat.type === "morning") {
              systemMessage =
                templateStore.templates.find(
                  (t) => t.type === "morningIntention" && t.isActive,
                )?.content || "";
            } else if (chat.type === "evening") {
              systemMessage =
                templateStore.templates.find(
                  (t) => t.type === "eveningReflection" && t.isActive,
                )?.content || "";
            } else {
              systemMessage =
                templateStore.templates.find(
                  (t) => t.type === "generic" && t.isActive,
                )?.content || "";
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

          const allMessages = [
            ...(systemMessage
              ? [{ role: "system" as const, content: systemMessage }]
              : []),
            ...messages.map((m) => ({ role: m.role, content: m.text })),
          ];

          const response = await openai.chat.completions.create(
            {
              model: activeModel,
              messages: allMessages,
              stream: true,
            },
            {
              signal: abortController.signal,
              headers: {
                "x-stainless-retry-count": null,
              },
            },
          );

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            assistantContent += content;
            if (!shouldThrottle) {
              await updateMessage(assistantMessageId as number, {
                text: assistantContent,
              });
            }
          }

          // Ensure all remaining characters are displayed
          if (shouldThrottle) {
            while (displayedContent.length < assistantContent.length) {
              if (abortController.signal.aborted) {
                break;
              }
              await new Promise((resolve) =>
                workerTimers.setTimeout(resolve, throttleDelay),
              );
              await updateCharByChar();
            }
          }

          if (updateInterval) {
            workerTimers.clearInterval(updateInterval);
          }

          if (!abortController.signal.aborted) {
            // Ensure the final content is updated
            await updateMessage(assistantMessageId as number, {
              text: assistantContent,
            });
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("AbortError", updateInterval);
            if (updateInterval) {
              workerTimers.clearInterval(updateInterval);
            }
            // Ensure we break out of the character display loop
            abortController.abort();
            return;
          }
          console.error("Error in chat:", error);
          await updateMessage(assistantMessageId as number, {
            text: "An error occurred. Please try again.",
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

        const response = await openai.chat.completions.create(
          {
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
            temperature: 0.5,
          },
          {
            headers: {
              "x-stainless-retry-count": null,
            },
          },
        );

        const title = response.choices[0]?.message?.content || "";
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

        const response = await openai.chat.completions.create(
          {
            model: chat.model,
            messages: [
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
                  "Extract the tasks from the conversation and return them as a JSON array. Do not return anything else.",
              },
            ],
            temperature: 0.5,
          },
          {
            headers: {
              "x-stainless-retry-count": null,
            },
          },
        );

        try {
          const content = response.choices[0]?.message?.content || "[]";
          console.log("Extracted tasks:", content);
          const tasks = JSON.parse(content);
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
      toggleSidebar: () =>
        set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
      regenerateReply: async (chatId: number) => {
        const messages = await getChatMessages(chatId);
        if (messages.length < 1) return; // No messages to regenerate

        // check if ollama is running first
        const ollamaRunning = await useOllamaStore
          .getState()
          .fetchInstalledModels();
        if (!ollamaRunning) return;

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
      setViewMode: (mode) => set({ viewMode: mode }),
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      useCmdEnterToSend: true,
      setUseCmdEnterToSend: (value) => set({ useCmdEnterToSend: value }),
      isEditTitleDialogOpen: false,
      setEditTitleDialogOpen: (isOpen: boolean) =>
        set({ isEditTitleDialogOpen: isOpen }),
      activeChatId: null,
      setActiveChatId: (id: number | null) => set({ activeChatId: id }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);
