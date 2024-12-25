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
import { QuickActionMenu } from "./QuickActionMenu";
import HomeHeader from "@/app/_components/HomeHeader";
import { Separator } from "@repo/ui/components/ui/separator";
import { ReflectionMenu } from "./ReflectionMenu";

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
    setSettingsCategory,
    checkOllamaStatus,
  } = useOllamaStore();

  const chat = useLiveQuery(async () => {
    return getChat(Number(chatId));
  }, [chatId]);

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

  useEffect(() => {
    setTimeout(() => {
      checkOllamaStatus();
    }, 1000);
    setTimeout(() => {
      checkOllamaStatus();
    }, 3000);
    setTimeout(() => {
      checkOllamaStatus();
    }, 5000);
  }, [checkOllamaStatus]);

  const onStartSession = () => {
    startSession(Number(chatId));
    chatInputRef.current?.focus();
  };

  const handleOpenSettings = () => {
    setSettingsCategory("AI");
    setIsSettingsOpen(true);
  };

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
      <div className="flex flex-col items-center justify-center h-full gap-4 max-w-xl mx-auto">
        <p className="text-lg text-gray-500">
          No model is currently active. Please select a model in Settings to use
          AI functionalities.
        </p>
        <Button onClick={handleOpenSettings}>Open Settings</Button>
      </div>
    );
  }

  const rightContent = chat ? (
    <div className="flex items-center space-x-2">
      {/* <Button variant="ghost" size="icon" onClick={toggleAdvancedSidebar}>
        <SlidersHorizontalIcon className="h-4 w-4" />
      </Button> */}
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full">
      <DateNavigationHeader
        showSidebarToggle={true}
        onSidebarToggle={toggleSidebar}
        rightContent={rightContent}
      />
      <div className="flex-1 overflow-hidden flex bg-background/80 dark:bg-background/50">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto h-full">
              <div className="h-full">
                {!chat && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-col items-end m-4">
                      <HomeHeader />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-4">
                      <NewChatCard type="morning" />
                      <NewChatCard type="evening" />
                      <NewChatCard type="year-end" />
                    </div>
                  </div>
                )}
                {chat && showStartSessionButton ? (
                  <div className="flex justify-center items-center h-full">
                    <Button onClick={onStartSession}>Start Session</Button>
                  </div>
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
                  <QuickReplyMenu chatId={Number(chatId)} />
                  {chat.type !== "year-end" && (
                    <QuickActionMenu chatId={Number(chatId)} />
                  )}
                  {chat.type === "year-end" && (
                    <ReflectionMenu chatId={Number(chatId)} />
                  )}
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
