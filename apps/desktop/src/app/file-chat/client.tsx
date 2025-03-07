"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useFileChatStore } from "@/store/fileChatStore";

export function FileChatClient() {
  const [newMessage, setNewMessage] = useState("");

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
    <div className="flex flex-col space-y-4">
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm font-mono">Storage directory: {baseDirectory}</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => createChat()} disabled={isLoading}>
          New Chat
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[600px]">
        {/* Chat List - Left Sidebar */}
        <div className="col-span-4 border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted font-medium">Today's Chats</div>
          <div className="overflow-y-auto h-[calc(600px-56px)]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No chats yet. Create a new chat to get started.
              </div>
            ) : (
              <div className="divide-y">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${
                      selectedChat?.id === chat.id ? "bg-muted" : ""
                    }`}
                    onClick={() => selectChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {chat.title || "Untitled Chat"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {chat.createdAt
                            ? format(new Date(chat.createdAt), "h:mm a")
                            : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (chat.id) deleteChat(chat.id);
                        }}
                      >
                        <span className="text-red-500">×</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Right Side */}
        <div className="col-span-8 border rounded-lg overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 bg-muted">
                <h2 className="font-medium">
                  {selectedChat.title || "Untitled Chat"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start typing to begin a conversation.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewMessage(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat or create a new one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
