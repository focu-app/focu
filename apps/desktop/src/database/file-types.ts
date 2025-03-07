/**
 * Type definitions for file-based storage
 * These are separate from the database types to allow for independent evolution
 */

export interface FileTimeStamped {
  createdAt?: number;
  updatedAt?: number;
}

export type FileChatType = "general" | "morning" | "evening" | "year-end";

/**
 * FileChat - represents a chat stored in a file
 * Uses UUID strings for IDs to ensure cross-device compatibility
 */
export interface FileChat extends FileTimeStamped {
  id: string;
  type: FileChatType;
  model: string;
  provider?: string;
  title?: string;
  summary?: string;
  summaryCreatedAt?: number;
  messages: FileMessage[];
  dateString: string;
}

/**
 * FileMessage - represents a message in a chat
 */
export interface FileMessage extends FileTimeStamped {
  id: number; // We could use UUIDs here too, but numeric IDs are fine for now
  text: string;
  role: "user" | "assistant" | "system";
  chatId: string; // References the parent chat's UUID
  hidden?: boolean;
}

/**
 * Converters between DB types and File types
 * These will be useful during the transition period
 */

// We can add converters here later if needed:
// export function dbChatToFileChat(dbChat: Chat): FileChat { ... }
// export function fileChatToDbChat(fileChat: FileChat): Chat { ... }
