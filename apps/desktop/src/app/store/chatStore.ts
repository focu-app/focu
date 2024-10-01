import { format, startOfDay } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useOllamaStore } from "../store";
import ollama from "ollama/browser";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

export interface Message {
  role: string;
  content: string;
  hidden?: boolean;
}

export interface Chat {
  id: string;
  messages: Message[];
  summary?: string;
  type: "morning" | "evening" | "general";
}

interface ChatStore {
  chats: { [date: string]: Chat[] };
  currentChatId: string | null;
  selectedDate: string;
  addChat: (type: "morning" | "evening" | "general") => string;
  setCurrentChat: (id: string) => void;
  addMessage: (message: Message) => void;
  clearCurrentChat: () => void;
  updateCurrentChat: (updatedMessages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  setSelectedDate: (date: Date) => void;
  ensureDailyChats: (date: Date) => void;
  showTasks: boolean;
  setShowTasks: (show: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,
      selectedDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
      addChat: (type: "morning" | "evening" | "general") => {
        const { chats, selectedDate } = get();
        const todayChats = chats[selectedDate] || [];

        // Check if there's an empty general chat for today
        const emptyChat = todayChats.find(chat =>
          chat.type === 'general' && chat.messages.length === 0
        );

        if (emptyChat) {
          // If an empty chat exists, return its ID instead of creating a new one
          set({ currentChatId: emptyChat.id });
          return emptyChat.id;
        }

        // If no empty chat, create a new one
        const newChat: Chat = {
          id: new Date().toISOString(), // Keep the existing ID logic
          type,
          messages: [],
        };

        set((state) => ({
          chats: {
            ...state.chats,
            [state.selectedDate]: [...todayChats, newChat],
          },
          currentChatId: newChat.id,
        }));

        return newChat.id;
      },
      setCurrentChat: (id: string) => set({ currentChatId: id }),
      addMessage: (message: Message) =>
        set((state) => {
          const dateString = state.selectedDate;
          const currentDateChats = state.chats[dateString] || [];
          const updatedChats = currentDateChats.map((chat) =>
            chat.id === state.currentChatId
              ? { ...chat, messages: [...chat.messages, message] }
              : chat,
          );
          return {
            chats: {
              ...state.chats,
              [dateString]: updatedChats,
            },
          };
        }),
      clearCurrentChat: () =>
        set((state) => {
          const dateString = state.selectedDate;
          const currentDateChats = state.chats[dateString] || [];
          const updatedChats = currentDateChats.map((chat) =>
            chat.id === state.currentChatId
              ? {
                ...chat,
                messages: [],
              }
              : chat
          );
          return {
            chats: {
              ...state.chats,
              [dateString]: updatedChats,
            },
          };
        }),
      updateCurrentChat: (updatedMessages: Message[]) =>
        set((state) => {
          const dateString = state.selectedDate;
          const currentDateChats = state.chats[dateString] || [];
          const updatedChats = currentDateChats.map((chat) =>
            chat.id === state.currentChatId
              ? { ...chat, messages: updatedMessages }
              : chat,
          );
          return {
            chats: {
              ...state.chats,
              [dateString]: updatedChats,
            },
          };
        }),
      deleteChat: (chatId: string) =>
        set((state) => {
          const dateString = state.selectedDate;
          const currentDateChats = state.chats[dateString] || [];
          const chatToDelete = currentDateChats.find(
            (chat) => chat.id === chatId,
          );

          if (chatToDelete && chatToDelete.type !== "general") {
            console.warn(
              "Attempted to delete a non-general chat. Operation aborted.",
            );
            return state;
          }

          const updatedChats = currentDateChats.filter(
            (chat) => chat.id !== chatId,
          );
          return {
            chats: {
              ...state.chats,
              [dateString]: updatedChats,
            },
            currentChatId: updatedChats.length > 0 ? updatedChats[0].id : null,
          };
        }),
      ensureDailyChats: (date: Date) => {
        const state = get();
        const dateString = format(startOfDay(date), "yyyy-MM-dd");
        const currentDateChats = state.chats[dateString] || [];

        const morningChat = currentDateChats.find(
          (chat) => chat.type === "morning",
        );
        const eveningChat = currentDateChats.find(
          (chat) => chat.type === "evening",
        );

        const updatedChats = [...currentDateChats];

        if (!morningChat) {
          const newMorningChatId = new Date(
            date.getTime() + 8 * 60 * 60 * 1000,
          ).toISOString(); // 8 AM
          updatedChats.push({
            id: newMorningChatId,
            messages: [],
            type: "morning",
            summary: undefined,
          });
        }

        if (!eveningChat) {
          const newEveningChatId = new Date(
            date.getTime() + 20 * 60 * 60 * 1000,
          ).toISOString(); // 8 PM
          updatedChats.push({
            id: newEveningChatId,
            messages: [],
            type: "evening",
            summary: undefined,
          });
        }

        set((state) => ({
          chats: {
            ...state.chats,
            [dateString]: updatedChats,
          },
        }));
      },
      setSelectedDate: (date: Date) => {
        const dateString = format(startOfDay(date), "yyyy-MM-dd");
        set({ selectedDate: dateString });
        get().ensureDailyChats(date);
      },
      setShowTasks: (show: boolean) => set({ showTasks: show }),
      showTasks: false, // Initialize showTasks
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);