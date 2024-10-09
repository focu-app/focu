"use client";

import { format, addDays, subDays } from "date-fns";
import {
  Loader2,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import {
  clearChat,
  deleteChat,
  getChat,
  getChatMessages,
  getChatsForDay,
} from "@/database/chats";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";
import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();

  const { selectedDate, setSelectedDate, isSidebarVisible, toggleSidebar } =
    useChatStore();

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

  const rightContent = (
    <div className="flex items-center space-x-2">
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
  );

  return (
    <div className="flex flex-col h-full">
      <DateNavigationHeader
        showSidebarToggle={true}
        onSidebarToggle={toggleSidebar}
        rightContent={rightContent}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="max-w-7xl mx-auto">
            <ChatMessages messages={messages || []} />
            {["morning", "evening"].includes(chat?.type || "") &&
              messages.filter((m) => m.role === "user").length === 0 && (
                <Button onClick={onStartSession}>Start Session</Button>
              )}
          </div>
        </div>
        <div className="p-4">
          <div className="lg:max-w-7xl w-full mx-auto">
            <ChatInput
              ref={chatInputRef}
              chatId={Number(chatId)}
              disabled={!chatId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
