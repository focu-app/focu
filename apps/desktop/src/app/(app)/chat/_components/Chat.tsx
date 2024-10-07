"use client";

import { Loader2, MessageSquare, Play, Trash2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Settings as SettingsIcon } from "lucide-react";

import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

import { useOllamaStore } from "@/app/store";
import {
  clearChat,
  deleteChat,
  getChat,
  getChatMessages,
  getChatsForDay,
} from "@/database/chats";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useChatStore } from "@/app/store/chatStore";
import type { Chat } from "@/database/db";
import React, { useRef, useEffect } from "react";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();

  const { selectedDate, startSession } = useChatStore();

  const { activeModel, isModelLoading, setIsSettingsOpen } = useOllamaStore();

  const chat = useLiveQuery(async () => {
    return getChat(Number(chatId));
  }, [chatId]);

  const chats = useLiveQuery(async () => {
    return getChatsForDay(new Date(selectedDate || ""));
  }, [selectedDate]);

  const messages = useLiveQuery(
    async () => {
      return getChatMessages(Number(chatId));
    },
    [chatId],
    [],
  );

  const onClearChat = () => {
    clearChat(Number(chatId));
  };

  const onDeleteChat = async () => {
    deleteChat(Number(chatId));
    const nextChat = chats?.find((chat) => chat.id !== Number(chatId));
    if (nextChat) {
      router.push(`/chat?id=${nextChat.id}`);
    } else {
      router.push("/chat");
    }
  };

  const onStartSession = () => {
    startSession(Number(chatId));
    chatInputRef.current?.focus();
  };

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatId) {
      chatInputRef.current?.focus();
    }
  }, [chatId]);

  if (isModelLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!activeModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-500">
          No model is currently active. Please select a model in Settings to use
          AI functionalities.
        </p>
        <Button onClick={() => setIsSettingsOpen(true)}>Open Settings</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">
          {format(new Date(selectedDate || ""), "MMMM d")}{" "}
        </h2>
        <div className="flex items-center space-x-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearChat}
              disabled={messages.length <= 1}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
            <Button variant="outline" size="sm" onClick={onDeleteChat}>
              <XCircle className="h-4 w-4 mr-2" />
              Delete Chat
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden lg:max-w-7xl w-full mx-auto">
        <ChatMessages messages={messages || []} />
        {["morning", "evening"].includes(chat?.type || "") &&
          messages.filter((m) => m.role === "user").length === 0 && (
            <Button onClick={onStartSession}>Start Session</Button>
          )}
      </div>
      <div className="lg:max-w-7xl w-full mx-auto">
        <div className="flex flex-col gap-4 p-4">
          <ChatInput
            ref={chatInputRef}
            chatId={Number(chatId)}
            disabled={!chatId}
          />
        </div>
      </div>
    </>
  );
}
