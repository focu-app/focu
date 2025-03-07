import { FileManager } from "./file-manager";
import type { FileChat, FileMessage } from "./file-types";
// Use crypto from global window if possible, avoids node import issues
const generateUUID = () => {
  // Browser's crypto.randomUUID if available
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  // Otherwise fall back to a simple implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Chat file manager singleton
let fileManager: FileManager | null = null;

// In-memory cache
const chatCache = new Map<string, FileChat>();

/**
 * Initialize the file chat manager
 */
export async function setupFileChatManager(): Promise<string> {
  if (!fileManager) {
    console.log("Creating new FileManager instance");
    fileManager = new FileManager();
    console.log("Initializing FileManager with chats directory");
    const baseDir = await fileManager.initialize("chats");
    console.log(`FileManager initialized at: ${baseDir}`);

    // Load existing chats
    console.log("Loading chats from disk into cache");
    await loadChatsFromDisk();
    console.log(`Cache now contains ${chatCache.size} chats`);
  } else {
    console.log("FileManager already initialized");
  }

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
    // Get all chat files (they follow the pattern: [date]-[type]-[uuid].json)
    const files = await fileManager.listFiles(
      "",
      /^\d{8}-[a-z-]+-[\w-]+\.json$/,
    );

    console.log(`Found ${files.length} chat files on disk`);

    for (const fileName of files) {
      try {
        const filePath = await fileManager.buildPath(fileName);
        const content = await fileManager.readFile(filePath);
        const chat = JSON.parse(content) as FileChat;

        // Make sure messages array exists
        if (!chat.messages) {
          chat.messages = [];
        }

        // Store in cache
        chatCache.set(fileName, chat);
      } catch (error) {
        console.error(`Error loading chat file ${fileName}:`, error);
      }
    }

    console.log(`Loaded ${chatCache.size} chats into cache`);
  } catch (error) {
    console.error("Error loading chats from disk:", error);
  }
}

/**
 * Generate a unique file ID for a chat
 */
function getChatFileId(chat: FileChat): string {
  // Format: YYYYMMDD-type-uuid
  const datePrefix = chat.dateString.replace(/-/g, "");
  return `${datePrefix}-${chat.type}-${chat.id}`;
}

/**
 * Add a new chat
 */
export async function addChat(chat: Omit<FileChat, "id">): Promise<string> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Generate a new UUID for the chat
  const chatId = generateUUID();

  // Create date-based filename
  const date = chat.dateString.replace(/-/g, ""); // Convert YYYY-MM-DD to YYYYMMDD
  const type = chat.type || "general";
  const fileId = `${date}-${type}-${chatId}.json`;

  // Create chat object with ID and timestamps
  const newChat: FileChat = {
    ...chat,
    id: chatId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: chat.messages || [],
  };

  // Store in the cache
  chatCache.set(fileId, newChat);

  // Write to disk
  const filePath = await fileManager.buildPath(fileId);
  await fileManager.writeFile(filePath, JSON.stringify(newChat, null, 2));

  console.log(`Added new chat: ${fileId}`);

  return chatId;
}

/**
 * Update an existing chat
 */
export async function updateChat(
  chatId: string,
  chatUpdates: Partial<FileChat>,
): Promise<string> {
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

  // Update the chat, preserving messages if not explicitly provided
  const updatedChat: FileChat = {
    ...chat,
    ...chatUpdates,
    messages: chatUpdates.messages || chat.messages || [],
    updatedAt: Date.now(),
  };

  // Update cache
  chatCache.set(fileId, updatedChat);

  // Write to disk
  const filePath = await fileManager.buildPath(fileId);
  await fileManager.writeFile(filePath, JSON.stringify(updatedChat, null, 2));

  return chatId;
}

/**
 * Get a chat by ID
 */
export async function getChat(id: string): Promise<FileChat | undefined> {
  return Array.from(chatCache.values()).find((chat) => chat.id === id);
}

/**
 * Get chats for a specific date
 */
export async function getChatsForDay(dateString: string): Promise<FileChat[]> {
  // If dateString is empty, return all chats
  if (!dateString) {
    return Array.from(chatCache.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    );
  }

  return Array.from(chatCache.values())
    .filter((chat) => chat.dateString === dateString)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string): Promise<void> {
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

  // Delete the chat file - fileId already includes the .json extension
  const chatFilePath = await fileManager.buildPath(fileId);

  try {
    console.log(`Deleting chat file: ${chatFilePath}`);
    await fileManager.deleteFile(chatFilePath);
    console.log(`Successfully deleted chat file: ${chatFilePath}`);
  } catch (error) {
    console.error(`Error deleting chat file ${chatFilePath}:`, error);
    throw error;
  }
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: string): Promise<FileMessage[]> {
  const chat = await getChat(chatId);
  return chat?.messages || [];
}

/**
 * Add a message to a chat
 */
export async function addMessage(
  message: Partial<FileMessage>,
): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  if (!message.chatId) {
    throw new Error("Chat ID is required to add a message");
  }

  // Find the chat
  const chat = await getChat(message.chatId);
  if (!chat) {
    throw new Error(`Chat with ID ${message.chatId} not found`);
  }

  // Create a complete message object
  const newMessage: FileMessage = {
    id: message.id ?? Math.max(0, ...chat.messages.map((m) => m.id)) + 1,
    text: message.text || "",
    role: message.role || "user",
    chatId: message.chatId,
    createdAt: message.createdAt || Date.now(),
    updatedAt: message.updatedAt || Date.now(),
    hidden: message.hidden,
  };

  // Add the message to the chat
  const updatedMessages = [...chat.messages, newMessage];

  // Update the chat with the new message
  await updateChat(chat.id, {
    messages: updatedMessages,
    updatedAt: Date.now(),
  });

  return newMessage.id;
}

/**
 * Update an existing message
 */
export async function updateMessage(
  messageId: number,
  updates: Partial<FileMessage>,
): Promise<number> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Find which chat this message belongs to
  let chatWithMessage: FileChat | undefined;

  for (const chat of chatCache.values()) {
    if (chat.messages.some((m) => m.id === messageId)) {
      chatWithMessage = chat;
      break;
    }
  }

  if (!chatWithMessage) {
    throw new Error(`Message with ID ${messageId} not found`);
  }

  // Update the message
  const updatedMessages = chatWithMessage.messages.map((msg) =>
    msg.id === messageId ? { ...msg, ...updates, updatedAt: Date.now() } : msg,
  );

  // Update the chat with the modified messages
  await updateChat(chatWithMessage.id, {
    messages: updatedMessages,
    updatedAt: Date.now(),
  });

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
  let chatWithMessage: FileChat | undefined;

  for (const chat of chatCache.values()) {
    if (chat.messages.some((m) => m.id === messageId)) {
      chatWithMessage = chat;
      break;
    }
  }

  if (!chatWithMessage) {
    throw new Error(`Message with ID ${messageId} not found`);
  }

  // Remove the message
  const updatedMessages = chatWithMessage.messages.filter(
    (msg) => msg.id !== messageId,
  );

  // Update the chat with the filtered messages
  await updateChat(chatWithMessage.id, {
    messages: updatedMessages,
    updatedAt: Date.now(),
  });
}

/**
 * Clear all non-system messages from a chat
 */
export async function clearChat(chatId: string): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  // Get the chat
  const chat = await getChat(chatId);
  if (!chat) {
    throw new Error(`Chat with ID ${chatId} not found`);
  }

  // Keep only system messages
  const systemMessages = chat.messages.filter((m) => m.role === "system");

  // Update the chat with only system messages
  await updateChat(chatId, {
    messages: systemMessages,
    updatedAt: Date.now(),
  });
}

/**
 * Get previous chats
 */
export async function getPreviousChats(
  limit = 5,
  currentChatId?: string,
): Promise<FileChat[]> {
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
  chatId: string,
): Promise<FileMessage[]> {
  const messages = await getChatMessages(chatId);

  return messages
    .filter((m) => m.role !== "system")
    .filter((m) => m.text.trim() !== "");
}

/**
 * Force a reload of all chats from disk
 * Useful when you need to ensure the cache is up to date
 */
export async function forceReloadChats(): Promise<FileChat[]> {
  // Clear the in-memory cache
  chatCache.clear();

  // Reload all chats from disk
  await loadChatsFromDisk();

  // Return all chats
  return Array.from(chatCache.values());
}

/**
 * Handle a file system event for a specific file path
 * This is a more efficient way to update the cache based on file system events
 *
 * @param path The full path of the changed file
 * @param eventType 'create' | 'modify' | 'remove'
 */
export async function handleFileChange(
  path: string,
  eventType: "create" | "modify" | "remove",
): Promise<void> {
  if (!fileManager) {
    throw new Error(
      "File manager not initialized. Call setupFileChatManager first.",
    );
  }

  try {
    console.log(`Handling ${eventType} event for file: ${path}`);

    // Extract the filename from the path - it's the last segment
    const pathSegments = path.split("/");
    const filename = pathSegments[pathSegments.length - 1];

    // For removal, we just remove from the cache
    if (eventType === "remove") {
      const chatEntry = Array.from(chatCache.entries()).find(
        ([key, _]) => key === filename,
      );

      if (chatEntry) {
        const [key, chat] = chatEntry;
        console.log(`Removing chat from cache: ${key}, ID: ${chat.id}`);
        chatCache.delete(key);
        return;
      }
    }

    // For create or modify, read the file and update cache
    if (eventType === "create" || eventType === "modify") {
      try {
        const content = await fileManager.readFile(path);
        const chat = JSON.parse(content) as FileChat;

        // Make sure messages array exists
        if (!chat.messages) {
          chat.messages = [];
        }

        // Store in cache with the filename as the key
        console.log(`Updating cache for chat: ${filename}, ID: ${chat.id}`);
        chatCache.set(filename, chat);
      } catch (error) {
        console.error(`Error reading file ${path}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error handling file change for ${path}:`, error);
  }
}

/**
 * Get chat ID from filename
 * This extracts the UUID from the filename pattern: [date]-[type]-[uuid].json
 *
 * @param filename The filename to extract ID from
 * @returns The chat ID or null if not found
 */
export function getChatIdFromFilename(filename: string): string | null {
  const match = filename.match(/\d{8}-[a-z-]+-([a-f0-9-]+)\.json$/i);
  return match ? match[1] : null;
}

/**
 * Get filename from chat ID
 * This finds the corresponding filename for a chat ID
 *
 * @param chatId The chat ID to look for
 * @returns The filename or null if not found
 */
export function getFilenameFromChatId(chatId: string): string | null {
  const chatEntry = Array.from(chatCache.entries()).find(
    ([_, chat]) => chat.id === chatId,
  );

  return chatEntry ? chatEntry[0] : null;
}
