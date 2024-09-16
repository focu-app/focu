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
  summary?: string;
  type: 'morning' | 'evening' | 'general';
}

interface ChatState {
  chats: { [date: string]: Chat[] };
  currentChatId: string | null;
  selectedDate: string; // Change this to string
  addChat: (type: 'morning' | 'evening' | 'general') => string;
  setCurrentChat: (id: string) => void;
  addMessage: (message: Message) => void;
  clearCurrentChat: () => void;
  updateCurrentChat: (updatedMessages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  summarizeCurrentChat: () => void;
  setSelectedDate: (date: Date) => void; // Keep this as Date
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,
      selectedDate: new Date().toISOString().split('T')[0], // Initialize as today's date string
      addChat: (type: 'morning' | 'evening' | 'general' = 'general') => {
        const state = get();
        const newChatId = new Date().toISOString();
        const dateString = state.selectedDate;
        set((state) => ({
          chats: {
            ...state.chats,
            [dateString]: [
              ...(state.chats[dateString] || []),
              { id: newChatId, messages: [], type, summary: undefined },
            ],
          },
          currentChatId: newChatId,
        }));
        return newChatId;
      },
      setCurrentChat: (id: string) => set({ currentChatId: id }),
      addMessage: (message: Message) => set((state) => {
        const dateString = state.selectedDate;
        const currentDateChats = state.chats[dateString] || [];
        const updatedChats = currentDateChats.map(chat =>
          chat.id === state.currentChatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        );
        return {
          chats: {
            ...state.chats,
            [dateString]: updatedChats,
          },
        };
      }),
      clearCurrentChat: () => set((state) => {
        const dateString = state.selectedDate;
        const currentDateChats = state.chats[dateString] || [];
        const updatedChats = currentDateChats.map(chat =>
          chat.id === state.currentChatId
            ? { ...chat, messages: chat.messages.filter(message => message.role === 'system') }
            : chat
        );
        return {
          chats: {
            ...state.chats,
            [dateString]: updatedChats,
          },
        };
      }),
      updateCurrentChat: (updatedMessages: Message[]) => set((state) => {
        const dateString = state.selectedDate;
        const currentDateChats = state.chats[dateString] || [];
        const updatedChats = currentDateChats.map(chat =>
          chat.id === state.currentChatId
            ? { ...chat, messages: updatedMessages }
            : chat
        );
        return {
          chats: {
            ...state.chats,
            [dateString]: updatedChats,
          },
        };
      }),
      deleteChat: (chatId: string) => set((state) => {
        const dateString = state.selectedDate;
        const currentDateChats = state.chats[dateString] || [];
        const updatedChats = currentDateChats.filter(chat => chat.id !== chatId);
        return {
          chats: {
            ...state.chats,
            [dateString]: updatedChats,
          },
          currentChatId: updatedChats.length > 0 ? updatedChats[0].id : null,
        };
      }),
      summarizeCurrentChat: async () => {
        const state = get();
        const currentChat = state.chats[state.selectedDate]?.find(chat => chat.id === state.currentChatId);
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

          set((state) => ({
            chats: {
              ...state.chats,
              [state.selectedDate]: state.chats[state.selectedDate].map(chat =>
                chat.id === state.currentChatId
                  ? { ...chat, summary: response.message.content }
                  : chat
              ),
            },
          }));
        } catch (error) {
          console.error('Error summarizing chat:', error);
        }
      },
      setSelectedDate: (date: Date) => set({ selectedDate: date.toISOString().split('T')[0] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);