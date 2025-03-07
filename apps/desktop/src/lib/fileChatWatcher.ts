import { watch } from "@tauri-apps/plugin-fs";
import * as fileChatManager from "@/database/file-chat-manager";
import { useFileChatStore } from "@/store/fileChatStore";

let watchUnsubscribe: (() => void) | null = null;

/**
 * Sets up file system watchers to automatically detect changes to chat files
 * and update the UI accordingly.
 *
 * @returns A cleanup function to remove the watchers
 */
export async function setupFileChatWatchers(): Promise<() => void> {
  if (watchUnsubscribe) {
    // Watcher already set up, return the existing cleanup function
    return watchUnsubscribe;
  }

  try {
    // Get the base directory for chat files
    const baseDir = await fileChatManager.setupFileChatManager();

    console.log(`Setting up file system watcher for ${baseDir}`);

    // Watch the chat directory with a small debounce to avoid excessive updates
    const unsubscribe = await watch(
      baseDir,
      async (event) => {
        console.log("File system event detected:", event);

        try {
          // Ignore events without paths
          if (
            !event.paths ||
            !Array.isArray(event.paths) ||
            event.paths.length === 0
          ) {
            return;
          }

          // Determine the event type
          let eventType: "create" | "modify" | "remove" | null = null;
          if (event.type && typeof event.type === "object") {
            if ("create" in event.type) eventType = "create";
            else if ("modify" in event.type) eventType = "modify";
            else if ("remove" in event.type) eventType = "remove";
          }

          if (!eventType) {
            console.log("Unknown event type, ignoring", event.type);
            return;
          }

          // Process each file path in the event
          let filesChanged = false;
          for (const path of event.paths) {
            // Update the cache with the changed file
            await fileChatManager.handleFileChange(path, eventType);
            filesChanged = true;

            // Special handling for the current chat being deleted
            if (eventType === "remove") {
              const store = useFileChatStore.getState();
              if (store.selectedChat) {
                // Extract chat ID from the filename
                const pathSegments = path.split("/");
                const filename = pathSegments[pathSegments.length - 1];
                const chatId = fileChatManager.getChatIdFromFilename(filename);

                // If the deleted file was the selected chat, clear the selection
                if (chatId && store.selectedChat.id === chatId) {
                  console.log("Current chat was deleted, clearing selection");
                  // @ts-ignore - The type definition requires FileChat but implementation accepts null
                  store.selectChat(null);
                }
              }
            }
          }

          // If files were changed, update the store's chat list
          if (filesChanged) {
            const store = useFileChatStore.getState();
            const currentViewMode = store.viewMode;
            const currentDate = store.selectedDate;

            // Get latest chats based on current view mode
            if (currentViewMode === "all") {
              // Just load all chats
              const allChats = await fileChatManager.getChatsForDay("");
              store.loadChats(""); // This will update the store state and trigger re-renders
            } else {
              // Load chats for specific date
              const dateChats =
                await fileChatManager.getChatsForDay(currentDate);
              store.loadChats(currentDate); // This will update the store state and trigger re-renders
            }

            // If a chat was modified, make sure we have the latest messages
            if (eventType === "modify" && store.selectedChat) {
              const freshChat = await fileChatManager.getChat(
                store.selectedChat.id,
              );
              if (freshChat) {
                // Simply re-selecting the chat will update the messages
                store.selectChat(freshChat);
              }
            }
          }
        } catch (err) {
          console.error("Error handling file system event:", err);
        }
      },
      {
        recursive: true, // Watch subdirectories too
        delayMs: 100, // Small debounce for responsiveness
      },
    );

    // Store the unsubscribe function
    watchUnsubscribe = unsubscribe;

    console.log("File system watcher set up successfully");

    // Return a cleanup function
    return () => {
      if (watchUnsubscribe) {
        watchUnsubscribe();
        watchUnsubscribe = null;
        console.log("File system watcher cleaned up");
      }
    };
  } catch (error) {
    console.error("Error setting up file system watcher:", error);
    // Return a no-op cleanup function
    return () => {};
  }
}

/**
 * Clean up the file system watchers
 */
export function cleanupFileChatWatchers(): void {
  if (watchUnsubscribe) {
    watchUnsubscribe();
    watchUnsubscribe = null;
    console.log("File system watcher cleaned up");
  }
}
