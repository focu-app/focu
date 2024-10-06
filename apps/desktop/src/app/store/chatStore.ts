import { addChat } from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChatStore {
  addChat: (chat: Chat) => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        await addChat(chat);
      },
      selectedDate: new Date(),
      setSelectedDate: (date: Date) => {
        set({ selectedDate: date });
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
