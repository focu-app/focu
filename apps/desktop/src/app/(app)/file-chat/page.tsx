"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { useFileChatStore } from "@/store/fileChatStore";
import { useSearchParams } from "next/navigation";
import * as fileChatManager from "@/database/file-chat-manager";
import { FileChatInput } from "@/components/file-chat/FileChatInput";
import { FileChatMessages } from "@/components/file-chat/FileChatMessages";

export default function FileChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get state and actions from the store
  const {
    isInitialized,
    isLoading,
    baseDirectory,
    selectedChat,
    messages,
    initialize,
    createChat,
    selectChat,
  } = useFileChatStore();

  // Initialize the file manager
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Select chat based on URL parameter
  useEffect(() => {
    const loadChat = async () => {
      if (chatId && isInitialized) {
        const chat = await fileChatManager.getChat(chatId);
        if (chat) {
          selectChat(chat);
        }
      }
    };

    loadChat();
  }, [chatId, isInitialized, selectChat]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Initializing file-based chat system...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">
          {selectedChat
            ? selectedChat.title ||
              `Chat - ${format(new Date(selectedChat.dateString), "PP")}`
            : "File-Based Chat (Experimental)"}
        </h1>
        {selectedChat && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Storage location: {baseDirectory}
            </p>
          </div>
        )}
      </div>

      {/* Chat content area */}
      {selectedChat ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat messages - use flex-1 to fill available space */}
          <div className="flex-1 overflow-hidden">
            <FileChatMessages messages={messages} />
          </div>

          {/* Chat input - fixed at bottom */}
          <div className="p-4">
            <div className="lg:max-w-4xl w-full mx-auto">
              <FileChatInput
                chatId={selectedChat.id}
                disabled={isLoading}
                ref={inputRef}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl font-semibold">Welcome to File-Based Chat</h2>
          <p className="text-center text-muted-foreground max-w-md">
            This is an experimental feature that stores chat data in local files
            instead of a database. Create a new chat to get started!
          </p>
          <Button onClick={() => createChat()}>New Chat</Button>
        </div>
      )}
    </div>
  );
}
