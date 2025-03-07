import { useFileChatStore } from "@/store/fileChatStore";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { FileChat } from "@/database/file-types";

/**
 * Creates a new chat and navigates to it
 * This provides a single, consistent implementation that can be used anywhere
 *
 * @param router Next.js router instance to use for navigation
 * @returns The newly created chat or null if creation failed
 */
export async function createNewChatAndNavigate(
  router: AppRouterInstance,
): Promise<FileChat | null> {
  try {
    // Get the store state and actions
    const { createChat } = useFileChatStore.getState();

    // Create a new chat
    const newChat = await createChat();

    // Navigate to the new chat
    if (newChat) {
      try {
        // Wrap router operations in try/catch to prevent unhandled promise rejections
        router.push(`/file-chat?id=${newChat.id}`);
      } catch (routerError) {
        console.error("Navigation error:", routerError);
      }
      return newChat;
    }

    return null;
  } catch (error) {
    console.error("Error creating new chat:", error);
    return null;
  }
}

/**
 * Deletes a chat and optionally navigates away if it's the current chat
 *
 * @param chatId ID of the chat to delete
 * @param router Next.js router instance to use for navigation
 * @param isCurrentChat Whether this is the currently selected chat
 */
export async function deleteChatAndRefresh(
  chatId: string,
  router: AppRouterInstance,
  isCurrentChat = false,
): Promise<void> {
  try {
    // Get the store state and actions
    const { deleteChat } = useFileChatStore.getState();

    // Delete the chat
    await deleteChat(chatId);

    // If this was the current chat, navigate away
    if (isCurrentChat) {
      try {
        // Wrap router operations in try/catch to prevent unhandled promise rejections
        router.push("/file-chat");
      } catch (routerError) {
        console.error("Navigation error:", routerError);
      }
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
}

/**
 * Clears all messages from a chat and refreshes the UI
 *
 * @param chatId ID of the chat to clear
 */
export async function clearChatAndRefresh(chatId: string): Promise<void> {
  try {
    // Get the store state and actions
    const { clearMessages } = useFileChatStore.getState();

    // Clear the chat messages
    await clearMessages();
  } catch (error) {
    console.error("Error clearing chat:", error);
  }
}
