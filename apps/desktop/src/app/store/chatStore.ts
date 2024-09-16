import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOllamaStore } from '../store';

export interface Message {
  role: string;
  content: string;
  hidden?: boolean;
}

export interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
  summary?: string;
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  addChat: () => void;
  setCurrentChat: (id: string) => void;
  addMessage: (message: Message) => void;
  clearCurrentChat: () => void;
  updateCurrentChat: (updatedMessages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  summarizeCurrentChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      addChat: () => set((state) => {
        const newChat: Chat = {
          id: Date.now().toString(),
          messages: [],
          createdAt: new Date(),
        };
        return {
          chats: [...state.chats, newChat],
          currentChatId: newChat.id,
        };
      }),
      setCurrentChat: (id: string) => set({ currentChatId: id }),
      addMessage: (message: Message) => set((state) => {
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
        if (!currentChat) return state;
        return {
          chats: state.chats.map(chat =>
            chat.id === state.currentChatId
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          ),
        };
      }),
      clearCurrentChat: () => set((state) => {
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
        if (!currentChat) return state;
        return {
          chats: state.chats.map(chat =>
            chat.id === state.currentChatId
              ? { ...chat, messages: chat.messages.filter(message => message.role === 'system') }
              : chat
          ),
        };
      }),
      updateCurrentChat: (updatedMessages: Message[]) => set((state) => {
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
        if (!currentChat) return state;
        return {
          chats: state.chats.map(chat =>
            chat.id === state.currentChatId
              ? { ...chat, messages: updatedMessages }
              : chat
          ),
        };
      }),
      deleteChat: (chatId: string) => set((state) => {
        const updatedChats = state.chats.filter(chat => chat.id !== chatId);
        return {
          chats: updatedChats,
          currentChatId: updatedChats.length > 0 ? updatedChats[0].id : null,
        };
      }),
      summarizeCurrentChat: async () => {
        const state = get();
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
        if (!currentChat) return;

        const ollama = (await import('ollama/browser')).default;
        const { summarizeChatInstruction } = await import('../../lib/persona');

        // Get the active model from the ollamaStore
        const activeModel = useOllamaStore.getState().activeModel;

        // If no active model, log an error and return
        if (!activeModel) {
          console.error('No active model found. Please activate a model first.');
          return;
        }

        try {
          const response = await ollama.chat({
            model: activeModel, // Use the active model
            messages: [
              { role: 'system', content: summarizeChatInstruction },
              { role: 'user', content: JSON.stringify(currentChat.messages) }
            ],
            options: { num_ctx: 4096 },
          });

          set({
            chats: state.chats.map(chat =>
              chat.id === state.currentChatId
                ? { ...chat, summary: response.message.content }
                : chat
            ),
          });
        } catch (error) {
          console.error('Error summarizing chat:', error);
        }
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);