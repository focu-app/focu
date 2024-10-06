import { addChat, addMessage, getChat, getChatMessages, updateMessage } from "@/database/chats";
import type { Chat, Message } from "@/database/db";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import ollama from "ollama/browser";

interface ChatStore {
  addChat: (chat: Chat) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: Date) => void;
  sendChatMessage: (chatId: number, input: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      addChat: async (chat: Chat) => {
        await addChat(chat);
      },
      selectedDate: null,
      setSelectedDate: (date: Date) => {
        set({ selectedDate: date.toISOString() });
      },
      isLoading: false,
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      sendChatMessage: async (chatId: number, input: string) => {
        const { setIsLoading } = get();
        setIsLoading(true);

        try {
          const chat = await getChat(chatId);
          if (!chat) throw new Error("Chat not found");

          const userMessage: Message = {
            chatId,
            role: "user",
            text: input
          };
          await addMessage(userMessage);

          const messages = await getChatMessages(chatId);
          const activeModel = chat.model; // Use the model from the chat

          const response = await ollama.chat({
            model: activeModel,
            messages: [
              { role: "system", content: "You are a helpful assistant." }, // Replace with your actual persona logic
              ...messages.map(m => ({ role: m.role, content: m.text })),
              { role: userMessage.role, content: userMessage.text },
            ],
            stream: true,
            options: { num_ctx: 4096 },
          });

          let assistantContent = "";

          const messageId = await addMessage({
            chatId,
            role: "assistant",
            text: assistantContent
          });

          for await (const part of response) {
            assistantContent += part.message.content;
            await updateMessage(messageId, {
              text: assistantContent
            });
          }


        } catch (error) {
          console.error("Error in chat:", error);
          await addMessage({
            chatId,
            role: "assistant",
            text: "An error occurred. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
