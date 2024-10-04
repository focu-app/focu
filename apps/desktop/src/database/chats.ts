import { db } from "./db";
import type { Chat, Message } from "./db";

export async function addChat(chat: Chat): Promise<number> {
  return db.chats.add(chat);
}

export async function updateChat(chat: Chat): Promise<number> {
  return db.chats.put(chat);
}

export async function getChatsForDay(date: Date): Promise<Chat[]> {
  return db.chats.where('date').equals(date.setHours(0, 0, 0, 0)).toArray();
}

export async function getChat(id: number): Promise<Chat | undefined> {
  return db.chats.get(id);
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
  return db.messages.where('chatId').equals(chatId).toArray();
}

export async function addMessage(message: Message): Promise<number> {
  return db.messages.add(message);
}

export async function updateMessage(message: Message): Promise<number> {
  return db.messages.put(message);
}

