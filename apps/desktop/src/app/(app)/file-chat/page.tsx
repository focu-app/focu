"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useFileChatStore } from "@/store/fileChatStore";
import { cn } from "@repo/ui/lib/utils";
import { useSearchParams } from "next/navigation";
import * as fileChatManager from "@/database/file-chat-manager";

export default function FileChatPage() {
  const [newMessage, setNewMessage] = useState("");
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  // Get state and actions from the store
  const {
    isInitialized,
    isLoading,
    baseDirectory,
    chats,
    selectedChat,
    messages,
    initialize,
    createChat,
    selectChat,
    deleteChat,
    sendMessage,
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

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

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

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4">
        {selectedChat ? (
          messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted",
                  )}
                >
                  {message.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No messages yet. Start a conversation!
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h2 className="text-xl font-semibold">
              Welcome to File-Based Chat
            </h2>
            <p className="text-center text-muted-foreground max-w-md">
              This is an experimental feature that stores chat data in local
              files instead of a database. Create a new chat to get started!
            </p>
            <Button onClick={() => createChat()}>New Chat</Button>
          </div>
        )}
      </div>

      {/* Message input */}
      {selectedChat && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
