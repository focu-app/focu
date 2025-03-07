import { format } from "date-fns";
import { exists } from "@tauri-apps/plugin-fs";
import { FileManager } from "./file-manager";
import type { Chat, Message, ChatType } from "./db";

// Chat file manager singleton
let fileManager: FileManager | null = null;

// In-memory cache
const chatCache = new Map<string, Chat>();
const messageCache = new Map<string, Message[]>();

/**
 * Initialize the file chat manager
 */
export async function setupFileChatManager(): Promise<string> {
  if (!fileManager) {
    fileManager = new FileManager();
    await fileManager.initialize("chats");
  }

  // Load existing chats
  await loadChatsFromDisk();

  return fileManager.getBaseDirectory();
}

/**
 * Load all chats from disk into memory cache
 */
async function loadChatsFromDisk(): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  try {
    // Get all chat files (they follow the pattern: [date]-[type]-[id].json)
    const files = await fileManager.listFiles(
      "",
      /^\d{8}-[a-z-]+-[\w-]+\.json$/,
    );

    for (const fileName of files) {
      try {
        // Skip message files
        if (fileName.includes("messages-")) continue;

        const filePath = await fileManager.buildPath(fileName);
        const content = await fileManager.readFile(filePath);
        const chat = JSON.parse(content) as Chat;

        // Cache the chat
        chatCache.set(fileName.replace(".json", ""), chat);
      } catch (error) {
        console.error(`Error loading chat file ${fileName}:`, error);
      }
    }

    console.log(`Loaded ${chatCache.size} chats from disk`);
  } catch (error) {
    console.error("Error loading chats from disk:", error);
  }
}

/**
 * Generate a unique file ID for a chat
 */
function getChatFileId(chat: Chat): string {
  // Format: YYYYMMDD-type-uuid
  const datePrefix = chat.dateString.replace(/-/g, "");
  const uniqueId = chat.id ? `${chat.id}` : fileManager?.generateId() || "";
  return `${datePrefix}-${chat.type}-${uniqueId}`;
}

/**
 * Add a new chat
 */
export async function addChat(chat: Chat): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Ensure required fields
  if (!chat.createdAt) chat.createdAt = Date.now();
  if (!chat.updatedAt) chat.updatedAt = Date.now();
  if (!chat.dateString) {
    chat.dateString = format(new Date(), "yyyy-MM-dd");
  }

  // Assign ID if not present
  if (!chat.id) {
    // Find the highest ID in the cache and add 1
    const highestId = Array.from(chatCache.values()).reduce(
      (max, c) => Math.max(max, c.id || 0),
      0,
    );
    chat.id = highestId + 1;
  }

  // Generate file ID
  const fileId = getChatFileId(chat);

  // Store in cache
  chatCache.set(fileId, chat);

  // Write to disk
  const filePath = await fileManager.buildPath(`${fileId}.json`);
  await fileManager.writeFile(filePath, JSON.stringify(chat, null, 2));

  return chat.id;
}

/**
 * Update an existing chat
 */
export async function updateChat(
  chatId: number,
  chatUpdates: Partial<Chat>,
): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Find the chat in the cache
  const chatEntry = Array.from(chatCache.entries()).find(
    ([_, chat]) => chat.id === chatId,
  );

  if (!chatEntry) {
    throw new Error(`Chat with ID ${chatId} not found`);
  }

  const [fileId, chat] = chatEntry;

  // Update the chat
  const updatedChat = {
    ...chat,
    ...chatUpdates,
    updatedAt: Date.now(),
  };

  // Update cache
  chatCache.set(fileId, updatedChat);

  // Write to disk
  const filePath = await fileManager.buildPath(`${fileId}.json`);
  await fileManager.writeFile(filePath, JSON.stringify(updatedChat, null, 2));

  return chatId;
}

/**
 * Get a chat by ID
 */
export async function getChat(id: number): Promise<Chat | undefined> {
  return Array.from(chatCache.values()).find((chat) => chat.id === id);
}

/**
 * Get chats for a specific date
 */
export async function getChatsForDay(dateString: string): Promise<Chat[]> {
  return Array.from(chatCache.values())
    .filter((chat) => chat.dateString === dateString)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Delete a chat and its messages
 */
export async function deleteChat(chatId: number): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Find the chat in the cache
  const chatEntry = Array.from(chatCache.entries()).find(
    ([_, chat]) => chat.id === chatId,
  );

  if (!chatEntry) {
    return; // Chat not found, nothing to delete
  }

  const [fileId, _] = chatEntry;

  // Remove from cache
  chatCache.delete(fileId);

  // Delete the chat file
  const chatFilePath = await fileManager.buildPath(`${fileId}.json`);
  await fileManager.deleteFile(chatFilePath);

  // Delete the messages file
  const messagesFilePath = await fileManager.buildPath(
    `messages-${chatId}.json`,
  );
  await fileManager.deleteFile(messagesFilePath);

  // Clear messages from cache
  messageCache.delete(`${chatId}`);
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: number): Promise<Message[]> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Check cache first
  const cacheKey = `${chatId}`;
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey) || [];
  }

  // Try to load from disk
  try {
    const filePath = await fileManager.buildPath(`messages-${chatId}.json`);
    if (await exists(filePath)) {
      const content = await fileManager.readFile(filePath);
      const messages = JSON.parse(content) as Message[];

      // Update cache
      messageCache.set(cacheKey, messages);

      return messages;
    }
  } catch (error) {
    console.error(`Error loading messages for chat ${chatId}:`, error);
  }

  return [];
}

/**
 * Add a message to a chat
 */
export async function addMessage(message: Message): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Set timestamps if not present
  if (!message.createdAt) message.createdAt = Date.now();
  if (!message.updatedAt) message.updatedAt = Date.now();

  // Load existing messages
  const existingMessages = await getChatMessages(message.chatId);

  // Assign ID if not present
  if (!message.id) {
    const highestId =
      existingMessages.length > 0
        ? Math.max(...existingMessages.map((m) => m.id || 0))
        : 0;
    message.id = highestId + 1;
  }

  // Add the message to the list
  const updatedMessages = [...existingMessages, message];

  // Update cache
  messageCache.set(`${message.chatId}`, updatedMessages);

  // Write to disk
  const filePath = await fileManager.buildPath(
    `messages-${message.chatId}.json`,
  );
  await fileManager.writeFile(
    filePath,
    JSON.stringify(updatedMessages, null, 2),
  );

  // Update the chat's updatedAt timestamp
  const chat = await getChat(message.chatId);
  if (chat) {
    await updateChat(message.chatId, { updatedAt: Date.now() });
  }

  return message.id;
}

/**
 * Update an existing message
 */
export async function updateMessage(
  messageId: number,
  updates: Partial<Message>,
): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Find which chat this message belongs to
  let chatId: number | undefined;
  let messages: Message[] = [];

  for (const [key, msgs] of messageCache.entries()) {
    const message = msgs.find((m) => m.id === messageId);
    if (message) {
      chatId = parseInt(key);
      messages = msgs;
      break;
    }
  }

  if (!chatId) {
    throw new Error(`Message with ID ${messageId} not found`);
  }

  // Update the message
  const updatedMessages = messages.map((msg) =>
    msg.id === messageId ? { ...msg, ...updates, updatedAt: Date.now() } : msg,
  );

  // Update cache
  messageCache.set(`${chatId}`, updatedMessages);

  // Write to disk
  const filePath = await fileManager.buildPath(`messages-${chatId}.json`);
  await fileManager.writeFile(
    filePath,
    JSON.stringify(updatedMessages, null, 2),
  );

  return messageId;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: number): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Find which chat this message belongs to
  let chatId: number | undefined;
  let messages: Message[] = [];

  for (const [key, msgs] of messageCache.entries()) {
    if (msgs.some((m) => m.id === messageId)) {
      chatId = parseInt(key);
      messages = msgs;
      break;
    }
  }

  if (!chatId) {
    throw new Error(`Message with ID ${messageId} not found`);
  }

  // Remove the message
  const updatedMessages = messages.filter((msg) => msg.id !== messageId);

  // Update cache
  messageCache.set(`${chatId}`, updatedMessages);

  // Write to disk
  const filePath = await fileManager.buildPath(`messages-${chatId}.json`);
  await fileManager.writeFile(
    filePath,
    JSON.stringify(updatedMessages, null, 2),
  );
}

/**
 * Clear all non-system messages from a chat
 */
export async function clearChat(chatId: number): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Get existing messages
  const messages = await getChatMessages(chatId);

  // Keep only system messages
  const systemMessages = messages.filter((m) => m.role === "system");

  // Update cache
  messageCache.set(`${chatId}`, systemMessages);

  // Write to disk
  const filePath = await fileManager.buildPath(`messages-${chatId}.json`);
  await fileManager.writeFile(
    filePath,
    JSON.stringify(systemMessages, null, 2),
  );
}

/**
 * Get previous chats
 */
export async function getPreviousChats(
  limit = 5,
  currentChatId?: number,
): Promise<Chat[]> {
  let chats = Array.from(chatCache.values());

  if (currentChatId) {
    const currentChat = chats.find((chat) => chat.id === currentChatId);
    if (currentChat?.createdAt) {
      chats = chats.filter(
        (chat) => (chat.createdAt || 0) < (currentChat.createdAt || 0),
      );
    }
  }

  // Sort by creation time, newest first
  return chats
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limit);
}

/**
 * Get recent messages for a chat
 */
export async function getRecentChatMessages(
  chatId: number,
): Promise<Message[]> {
  const messages = await getChatMessages(chatId);

  return messages
    .filter((m) => m.role !== "system")
    .filter((m) => m.text.trim() !== "");
}
