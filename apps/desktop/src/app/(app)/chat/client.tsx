"use client";

import { DateNavigationHeader } from "@/components/DateNavigationHeader";
import HomeHeader from "@/components/HomeHeader";
import { AdvancedSettingsSidebar } from "@/components/chat/AdvancedSettingsSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { NewChatCard } from "@/components/chat/NewChatCard";
import { QuickActionMenu } from "@/components/chat/QuickActionMenu";
import { QuickReplyMenu } from "@/components/chat/QuickReplyMenu";
import { ReflectionMenu } from "@/components/chat/ReflectionMenu";
import { getChat, getChatMessages } from "@/database/chats";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useAppStore } from "@/store/appStore";
import { useChatStore } from "@/store/chatStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, StopCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default function ChatClient() {
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const {
    selectedDate,
    startSession,
    toggleSidebar,
    toggleAdvancedSidebar,
    summarizeChat,
  } = useChatStore();

  const { checkOllamaStatus, installedModels } = useOllamaStore();

  const { activeModel } = useAIProviderStore();

  const { visibleChatTypes } = useSettingsStore();
  const { isAppLoading } = useAppStore();
  const { setIsSettingsOpen, setSettingsCategory } = useSettingsStore();

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

  // Add stop reply shortcut
  useHotkeys(
    "mod+shift+s",
    () => {
      if (replyLoading) {
        stopReply();
      }
    },
    {
      enabled: replyLoading,
      enableOnFormTags: true,
    },
    [replyLoading, stopReply],
  );

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

  useEffect(() => {
    const currentChatId = chatId;

    return () => {
      if (currentChatId) {
        const checkAndSummarize = async () => {
          const chat = await getChat(Number(currentChatId));
          const messages = await getChatMessages(Number(currentChatId));
          if (!chat || messages.length < 4) return;

          // Only create/update summary if it doesn't exist or is outdated
          const lastMessage = messages[messages.length - 1];
          if (
            !chat.summary ||
            !chat.summaryCreatedAt ||
            chat.summaryCreatedAt < lastMessage.createdAt!
          ) {
            try {
              await summarizeChat(Number(currentChatId));
            } catch (error) {
              console.error(error);
            }
          }
        };

        checkAndSummarize();
      }
    };
  }, [chatId, summarizeChat]);

  const onStartSession = () => {
    startSession(Number(chatId));
    chatInputRef.current?.focus();
  };

  const handleOpenSettings = () => {
    setSettingsCategory("Local AI");
    setIsSettingsOpen(true);
  };

  if (isAppLoading) {
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
          Please {installedModels.length === 0 ? "install" : "select"} a default
          model to use AI functionalities.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={handleOpenSettings}>Open Settings</Button>
        </div>
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
                {!chatId && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex flex-col items-end m-4">
                      <HomeHeader />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-4">
                      {visibleChatTypes.morning && (
                        <NewChatCard type="morning" />
                      )}
                      {visibleChatTypes.evening && (
                        <NewChatCard type="evening" />
                      )}
                      {visibleChatTypes["year-end"] && (
                        <NewChatCard type="year-end" />
                      )}
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
                <Tooltip>
                  <TooltipTrigger>
                    <Button onClick={stopReply} variant="destructive" size="sm">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop Reply
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <kbd>CMD+shift+S</kbd>
                  </TooltipContent>
                </Tooltip>
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
