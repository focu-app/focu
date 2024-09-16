import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: string;
  content: string;
  hidden?: boolean;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);