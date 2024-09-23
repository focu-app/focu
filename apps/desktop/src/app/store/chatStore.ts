import { format, startOfDay } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOllamaStore } from "../store";
import ollama from "ollama/browser";

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
  suggestedReplies: string[];
  isSuggestedRepliesLoading: boolean;
}

interface ChatStore {
  chats: { [date: string]: Chat[] };
  currentChatId: string | null;
  selectedDate: string; // Change this to string
  addChat: (type: "morning" | "evening" | "general") => string;
  setCurrentChat: (id: string) => void;
  addMessage: (message: Message) => void;
  clearCurrentChat: () => void;
  updateCurrentChat: (updatedMessages: Message[]) => void;
  deleteChat: (chatId: string) => void;
  summarizeCurrentChat: () => void;
  setSelectedDate: (date: Date) => void; // Keep this as Date
  ensureDailyChats: (date: Date) => void;
  showTasks: boolean;
  setShowTasks: (show: boolean) => void;
  suggestedReplies: string[];
  generateSuggestedReplies: (chatId: string) => Promise<void>;
  clearSuggestedReplies: (chatId: string) => void;
  setSuggestedRepliesLoading: (chatId: string, isLoading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,
      selectedDate: format(startOfDay(new Date()), "yyyy-MM-dd"),
      addChat: (type: "morning" | "evening" | "general") => {
        const state = get();
        const newChatId = new Date().toISOString();
        const dateString = state.selectedDate;
        set((state) => ({
          chats: {
            ...state.chats,
            [dateString]: [
              ...(state.chats[dateString] || []),
              { id: newChatId, messages: [], type, summary: undefined, suggestedReplies: [], isSuggestedRepliesLoading: false },
            ],
          },
          currentChatId: newChatId,
        }));
        return newChatId;
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
                suggestedReplies: [], // Clear suggested replies
                isSuggestedRepliesLoading: false, // Reset loading state
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
      summarizeCurrentChat: async () => {
        const state = get();
        const currentChat = state.chats[state.selectedDate]?.find(
          (chat) => chat.id === state.currentChatId,
        );
        if (!currentChat) return;

        const ollama = (await import("ollama/browser")).default;
        const { summarizeChatInstruction } = await import("../../lib/persona");

        // Get the active model from the ollamaStore
        const activeModel = useOllamaStore.getState().activeModel;

        // If no active model, log an error and return
        if (!activeModel) {
          console.error(
            "No active model found. Please activate a model first.",
          );
          return;
        }

        try {
          const response = await ollama.chat({
            model: activeModel, // Use the active model
            messages: [
              { role: "system", content: summarizeChatInstruction },
              { role: "user", content: JSON.stringify(currentChat.messages) },
            ],
            options: { num_ctx: 4096 },
          });

          set((state) => ({
            chats: {
              ...state.chats,
              [state.selectedDate]: state.chats[state.selectedDate].map(
                (chat) =>
                  chat.id === state.currentChatId
                    ? { ...chat, summary: response.message.content }
                    : chat,
              ),
            },
          }));
        } catch (error) {
          console.error("Error summarizing chat:", error);
        }
      },
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
            suggestedReplies: [],
            isSuggestedRepliesLoading: false,
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
            suggestedReplies: [],
            isSuggestedRepliesLoading: false,
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
      suggestedReplies: [],
      generateSuggestedReplies: async (chatId: string) => {
        const { activeModel } = useOllamaStore.getState();
        const { chats, selectedDate, setSuggestedRepliesLoading } = get();
        const currentChat = chats[selectedDate]?.find(chat => chat.id === chatId);
        const messages = currentChat?.messages || [];

        if (!activeModel || messages.length === 0) return;

        setSuggestedRepliesLoading(chatId, true); // Set loading to true

        const systemMessage = {
          content: `You are an AI that helps predict what the user could want to ask next to their AI assisant.

Your goal is to look at the conversation and try to predict on what the user could want to ask next. Focus on the conversation and only use the bio, if pressent, for background information. It could be a question, a statement, or a command.

Create two suggestions for the user to ask next. The suggestions should be in the perspective of the user, not the assistant, and should be the full text.

Please keep in mind the original sentiment of the conversation.

Reply with a JSON array in the following format: "{ "suggestions": string[] }"`,
          role: "system" as const,
        };

        const message = {
          role: "user" as const,
          content: `
Conversation between user and AI assistant:
---
${messages
              .map((message) => ({
                content: message.content,
                role: message.role,
              }))
              .filter(
                (message) => message.content.trim() !== "" && message.role !== "system",
              )
              .map((message) => {
                return `${message.role}: ${message.content}`;
              })
              .join("\n\n")}
---

Look at the conversation and create the two suggestions from the user's perspective what they could ask next to the assistant. Reply in the JSON format as instructed.`,
        };

        try {
          const response = await ollama.chat({
            model: activeModel,
            messages: [systemMessage, message],
            stream: false,
            options: { num_ctx: 4096 },
          });

          const suggestions = JSON.parse(response.message.content).suggestions;
          set((state) => ({
            chats: {
              ...state.chats,
              [selectedDate]: state.chats[selectedDate].map(chat =>
                chat.id === chatId ? { ...chat, suggestedReplies: suggestions, isSuggestedRepliesLoading: false } : chat
              ),
            },
          }));
        } catch (error) {
          console.error("Error generating suggested replies:", error);
          set((state) => ({
            chats: {
              ...state.chats,
              [selectedDate]: state.chats[selectedDate].map(chat =>
                chat.id === chatId ? { ...chat, suggestedReplies: [], isSuggestedRepliesLoading: false } : chat
              ),
            },
          }));
        }
      },
      clearSuggestedReplies: (chatId: string) => set((state) => ({
        chats: {
          ...state.chats,
          [state.selectedDate]: state.chats[state.selectedDate].map(chat =>
            chat.id === chatId ? { ...chat, suggestedReplies: [] } : chat
          ),
        },
      })),
      setSuggestedRepliesLoading: (chatId: string, isLoading: boolean) => set((state) => ({
        chats: {
          ...state.chats,
          [state.selectedDate]: state.chats[state.selectedDate].map(chat =>
            chat.id === chatId ? { ...chat, isSuggestedRepliesLoading: isLoading } : chat
          ),
        },
      })),
    }),
    {
      name: "chat-storage",
    },
  ),
);
