"use client";
import { useState, useEffect } from "react";
import { useFileChatStore } from "@/store/fileChatStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import * as fileChatManager from "@/database/file-chat-manager";

export function EditChatTitleDialog() {
  const [newTitle, setNewTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // State to track our own dialog open state since the file chat store doesn't have this
  const [isDialogOpen, setDialogOpen] = useState(false);

  // This is a workaround since we don't have a direct "editTitleDialogOpen" in the file chat store
  // In a future implementation, we could add this to the store
  useEffect(() => {
    // Create a global event listener for opening the dialog
    const handleOpenEditDialog = (event: CustomEvent) => {
      const { chatId } = event.detail;
      setChatId(chatId);
      setDialogOpen(true);

      // Set initial title based on the selected chat
      const loadChat = async () => {
        if (chatId) {
          const chat = await fileChatManager.getChat(chatId);
          if (chat?.title) {
            setNewTitle(chat.title);
          }
        }
      };

      loadChat();
    };

    // Add the event listener
    window.addEventListener(
      "file-chat:open-edit-title" as any,
      handleOpenEditDialog,
    );

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener(
        "file-chat:open-edit-title" as any,
        handleOpenEditDialog,
      );
    };
  }, []);

  const handleSave = async () => {
    if (chatId) {
      try {
        // Get the current chat
        const chat = await fileChatManager.getChat(chatId);

        if (chat) {
          // Update the chat title
          await fileChatManager.updateChat(chatId, {
            ...chat,
            title: newTitle.trim(),
          });

          // Reload the selected chat in the store if it's the currently selected one
          const { selectedChat, selectChat } = useFileChatStore.getState();
          if (selectedChat?.id === chatId) {
            const updatedChat = await fileChatManager.getChat(chatId);
            if (updatedChat) {
              selectChat(updatedChat);
            }
          }
        }
      } catch (error) {
        console.error("Error updating chat title:", error);
      }
    }

    setDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
          <DialogDescription>Change the title of this chat.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter chat title"
            className="w-full"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
