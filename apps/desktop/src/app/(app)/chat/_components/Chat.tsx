"use client";

import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import StartOllamaButton from "@/app/_components/StartOllamaButton";
import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { getChat, getChatMessages, getChatsForDay } from "@/database/chats";
import { Button } from "@repo/ui/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, SlidersHorizontalIcon, StopCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AdvancedSettingsSidebar } from "./AdvancedSettingsSidebar";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { NewChatCard } from "./NewChatCard";
import { QuickReplyMenu } from "./QuickReplyMenu";
import { RegenerateReplyButton } from "./RegenerateReplyButton";
import { QuickActionMenu } from "./QuickActionMenu";

export default function ChatClient() {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const { selectedDate, startSession, toggleSidebar, toggleAdvancedSidebar } =
    useChatStore();

  const {
    activeModel,
    isModelLoading,
    setIsSettingsOpen,
    isOllamaRunning,
    checkOllamaStatus,
  } = useOllamaStore();

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

  const showStartSessionButton =
    ["morning", "evening"].includes(chat?.type || "") &&
    messages.filter((m) => m.role === "user").length === 0;

  const { replyLoading, stopReply } = useChatStore();

  useEffect(() => {
    if (chatId) {
      chatInputRef.current?.focus();
    }
  }, [chatId]);

  const onStartSession = () => {
    startSession(Number(chatId));
    chatInputRef.current?.focus();
  };

  if (isModelLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isOllamaRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-center text-lg text-gray-500 max-w-xl">
          Ollama is not running. Please try to start it manually. If nothing
          happens, please restart the app.
        </p>
        <StartOllamaButton />
      </div>
    );
  }

  if (!activeModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
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
      <Button variant="ghost" size="icon" onClick={toggleAdvancedSidebar}>
        <SlidersHorizontalIcon className="h-4 w-4" />
      </Button>
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full bg-background/20">
      <DateNavigationHeader
        showSidebarToggle={true}
        onSidebarToggle={toggleSidebar}
        rightContent={rightContent}
      />
      <div className="flex-1 overflow-hidden flex bg-background/80 dark:bg-background/50">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-7xl mx-auto h-full">
              <div className="flex justify-center items-center h-full">
                {!chat && (
                  <div className="flex flex-col md:flex-row gap-4 my-2 justify-center">
                    <NewChatCard type="morning" />
                    <NewChatCard type="evening" />
                  </div>
                )}
                {chat && showStartSessionButton ? (
                  <Button onClick={onStartSession}>Start Session</Button>
                ) : (
                  <ChatMessages messages={messages || []} />
                )}
              </div>
            </div>
          </div>
          {chat && (
            <div className="flex flex-row gap-2 justify-center my-2">
              {messages.some((m) => m.role === "assistant") && (
                <>
                  <RegenerateReplyButton chatId={Number(chatId)} />
                  <QuickReplyMenu chatId={Number(chatId)} />
                  <QuickActionMenu chatId={Number(chatId)} />
                </>
              )}

              {replyLoading && (
                <Button onClick={stopReply} variant="destructive" size="sm">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Reply
                </Button>
              )}
            </div>
          )}
          {chat && (
            <div className="p-4">
              <div className="lg:max-w-4xl w-full mx-auto">
                <ChatInput
                  ref={chatInputRef}
                  chatId={Number(chatId)}
                  disabled={!chatId || showStartSessionButton}
                />
              </div>
            </div>
          )}
        </div>
        <AdvancedSettingsSidebar />
      </div>
    </div>
  );
}
