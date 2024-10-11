import {
  addChat,
  addMessage,
  clearChat,
  deleteChat,
  getChat,
  getChatMessages,
  updateChat,
  updateMessage,
} from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import {
  eveningReflectionPersona,
  genericPersona,
  morningIntentionPersona,
} from "@/lib/persona";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChatStore {
  addChat: (chat: Chat) => Promise<number>;
  startSession: (chatId: number) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: Date) => void;
  sendChatMessage: (chatId: number, input: string) => Promise<void>;
  generateChatTitle: (chatId: number) => Promise<void>;
  replyLoading: boolean;
  setReplyLoading: (isLoading: boolean) => void;
  clearChat: (chatId: number) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  isNewChatDialogOpen: boolean;
  setNewChatDialogOpen: (isOpen: boolean) => void;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
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
          const selectedModel = chat.model; // Use the model from the chat

          const response = await ollama.chat({
            model: selectedModel,
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
      replyLoading: false,
      setReplyLoading: (isLoading: boolean) => set({ replyLoading: isLoading }),
      isNewChatDialogOpen: false,
      setNewChatDialogOpen: (isOpen: boolean) =>
        set({ isNewChatDialogOpen: isOpen }),
      isSidebarVisible: true,
      toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useChatStore);
