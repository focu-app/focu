import { create } from "zustand";
import { format } from "date-fns";
import * as fileChatManager from "@/database/file-chat-manager";
import type {
  FileChat,
  FileMessage,
  FileChatType,
} from "@/database/file-types";

interface FileChatStore {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  baseDirectory: string;
  chats: FileChat[];
  selectedChat: FileChat | null;
  messages: FileMessage[];

  // Actions
  initialize: () => Promise<void>;
  loadChats: (dateString?: string) => Promise<void>;
  createChat: (type?: string) => Promise<FileChat | null>;
  selectChat: (chat: FileChat) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}

export const useFileChatStore = create<FileChatStore>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  baseDirectory: "",
  chats: [],
  selectedChat: null,
  messages: [],

  // Actions
  initialize: async () => {
    try {
      set({ isLoading: true });
      const baseDir = await fileChatManager.setupFileChatManager();
      set({ baseDirectory: baseDir });

      // Load today's chats
      await get().loadChats();

      set({ isInitialized: true });
    } catch (error) {
      console.error("Error initializing file chat manager:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadChats: async (dateString) => {
    try {
      set({ isLoading: true });

      // Default to today
      const date = dateString || format(new Date(), "yyyy-MM-dd");
      const chats = await fileChatManager.getChatsForDay(date);

      set({ chats });
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createChat: async (type = "general") => {
    try {
      set({ isLoading: true });

      const today = format(new Date(), "yyyy-MM-dd");
      const newChat = {
        type: type as FileChatType,
        model: "gpt-3.5-turbo",
        dateString: today,
        title: `New Chat (${format(new Date(), "h:mm a")})`,
        messages: [],
      };

      const chatId = await fileChatManager.addChat(newChat);
      await get().loadChats();

      // Find the newly created chat
      const createdChat = await fileChatManager.getChat(chatId);

      if (createdChat) {
        await get().selectChat(createdChat);
        return createdChat;
      }

      return null;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  selectChat: async (chat) => {
    try {
      set({ isLoading: true, selectedChat: chat });

      const chatMessages = await fileChatManager.getChatMessages(chat.id);
      set({ messages: chatMessages });
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChat: async (chatId) => {
    try {
      set({ isLoading: true });

      await fileChatManager.deleteChat(chatId);

      const { selectedChat } = get();
      if (selectedChat?.id === chatId) {
        set({ selectedChat: null, messages: [] });
      }

      await get().loadChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (text) => {
    const { selectedChat } = get();
    if (!selectedChat || !text.trim()) return;

    try {
      set({ isLoading: true });

      // Add user message
      const userMessage = {
        text,
        role: "user" as const,
        chatId: selectedChat.id,
      };

      await fileChatManager.addMessage(userMessage);

      // Simple echo response (would be replaced with actual AI response)
      const assistantMessage = {
        text: `You said: ${text}`,
        role: "assistant" as const,
        chatId: selectedChat.id,
      };

      await fileChatManager.addMessage(assistantMessage);

      // Reload messages
      const messages = await fileChatManager.getChatMessages(selectedChat.id);

      // Also update the selectedChat to include the new messages
      const updatedChat = await fileChatManager.getChat(selectedChat.id);

      set({
        messages,
        selectedChat: updatedChat || selectedChat,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearMessages: async () => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    try {
      set({ isLoading: true });

      await fileChatManager.clearChat(selectedChat.id);

      // Reload messages (should only contain system messages)
      const messages = await fileChatManager.getChatMessages(selectedChat.id);

      // Also update the selectedChat
      const updatedChat = await fileChatManager.getChat(selectedChat.id);

      set({
        messages,
        selectedChat: updatedChat || selectedChat,
      });
    } catch (error) {
      console.error("Error clearing messages:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
