import { db } from "./db";
import type { Chat, Message } from "./db";

export async function addChat(chat: Chat): Promise<number> {
  return db.chats.add(chat);
}

export async function updateChat(
  chatId: number,
  chat: Partial<Chat>,
): Promise<number> {
  return db.chats.update(chatId, chat);
}

export async function getChatsForDay(dateString: string): Promise<Chat[]> {
  return db.chats.where("dateString").equals(dateString).toArray();
}

export async function getChat(id: number): Promise<Chat | undefined> {
  return db.chats.get(id);
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
  return db.messages.where("chatId").equals(chatId).toArray();
}

export async function addMessage(message: Message): Promise<number> {
  return db.messages.add(message);
}

export async function updateMessage(
  messageId: number,
  message: Partial<Message>,
): Promise<number> {
  return db.messages.update(messageId, message);
}

export async function clearChat(chatId: number): Promise<void> {
  const messages = await db.messages.where("chatId").equals(chatId).toArray();

  const messageIds = messages
    .filter((m) => m.id)
    .filter((m) => m.role !== "system")
    .map((m) => Number(m.id));
  await db.messages.bulkDelete(messageIds);
}

export async function deleteChat(chatId: number): Promise<void> {
  await db.chats.delete(chatId);
  await db.messages.where("chatId").equals(chatId).delete();
}

export async function deleteMessage(messageId: number): Promise<void> {
  await db.messages.delete(messageId);
}

export async function getRecentChats(limit = 5): Promise<Chat[]> {
  return db.chats.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function getRecentChatMessages(
  chatId: number,
): Promise<Message[]> {
  return db.messages
    .where("chatId")
    .equals(chatId)
    .filter((m) => m.role !== "system")
    .filter((m) => m.text.trim() !== "")
    .toArray();
}
