"use client";

import { format, addDays, subDays } from "date-fns";
import {
  Loader2,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Settings,
  FlaskConicalIcon,
  SlidersHorizontal,
  SlidersHorizontalIcon,
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
import { useRef, useEffect, useState } from "react";
import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { TaskExtractionButton } from "./TaskExtractionButton";
import { RegenerateReplyButton } from "./RegenerateReplyButton";
import { AdvancedSettingsSidebar } from "./AdvancedSettingsSidebar";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();

  const { selectedDate, startSession, toggleSidebar, toggleAdvancedSidebar } =
    useChatStore();

  const { activeModel, isModelLoading, setIsSettingsOpen } = useOllamaStore();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"clear" | "delete">("clear");

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
    setAlertType("clear");
    setIsAlertOpen(true);
  };

  const onDeleteChat = () => {
    setAlertType("delete");
    setIsAlertOpen(true);
  };

  const handleAlertConfirm = async () => {
    if (alertType === "clear") {
      clearChat(Number(chatId));
    } else {
      await deleteChat(Number(chatId));
      const nextChat = chats?.find((chat) => chat.id !== Number(chatId));
      if (nextChat) {
        router.push(`/chat?id=${nextChat.id}`);
      } else {
        router.push("/chat");
      }
    }
    setIsAlertOpen(false);
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

  const rightContent = chat ? (
    <div className="flex items-center space-x-2">
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearChat}
            disabled={messages.length <= 1}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </AlertDialogTrigger>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={onDeleteChat}>
            <XCircle className="h-4 w-4 mr-2" />
            Delete Chat
          </Button>
        </AlertDialogTrigger>
        <Button variant="outline" size="icon" onClick={toggleAdvancedSidebar}>
          <SlidersHorizontalIcon className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertType === "clear" ? "Clear Chat" : "Delete Chat"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertType === "clear"
                ? "Are you sure you want to clear this chat? This action cannot be undone."
                : "Are you sure you want to delete this chat? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAlertConfirm}>
              {alertType === "clear" ? "Clear" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ) : null;

  const showStartSessionButton =
    ["morning", "evening"].includes(chat?.type || "") &&
    messages.filter((m) => m.role === "user").length === 0;

  return (
    <div className="flex flex-col h-full">
      <DateNavigationHeader
        showSidebarToggle={true}
        onSidebarToggle={toggleSidebar}
        rightContent={rightContent}
      />
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-7xl mx-auto h-full">
              <div className="flex justify-center items-center h-full">
                {showStartSessionButton ? (
                  <Button onClick={onStartSession}>Start Session</Button>
                ) : (
                  <ChatMessages messages={messages || []} />
                )}
              </div>
            </div>
          </div>
          {chatId && (
            <div className="flex flex-row gap-2 justify-center my-2">
              {messages.some((m) => m.role === "assistant") && (
                <RegenerateReplyButton chatId={Number(chatId)} />
              )}
              {messages.filter((m) => m.role === "user").length > 2 && (
                <TaskExtractionButton chatId={Number(chatId)} />
              )}
            </div>
          )}
          <div className="p-4">
            <div className="lg:max-w-5xl w-full mx-auto">
              <ChatInput
                ref={chatInputRef}
                chatId={Number(chatId)}
                disabled={!chatId || showStartSessionButton}
              />
            </div>
          </div>
        </div>
        <AdvancedSettingsSidebar />
      </div>
    </div>
  );
}
