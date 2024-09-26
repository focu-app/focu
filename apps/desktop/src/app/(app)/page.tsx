"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Play, Trash2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import ollama from "ollama/browser";

import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Settings as SettingsIcon } from "lucide-react";
import { SettingsDialog } from "../_components/SettingsDialog";

import { ChatInput } from "../_components/ChatInput";
import { ChatMessages } from "../_components/ChatMessages";
import { TaskList } from "../_components/TaskList";
import PomodoroTimer from "../tray/PomodoroTimer";
import { NotePad } from "../_components/NotePad";

import { useOllamaStore } from "../store";
import { type Chat, type Message, useChatStore } from "../store/chatStore";
import {
  eveningReflectionMessage,
  morningIntentionMessage,
} from "../../lib/persona";

export default function Home() {
  const {
    chats,
    currentChatId,
    addChat,
    setCurrentChat,
    addMessage,
    clearCurrentChat,
    updateCurrentChat,
    deleteChat,
    selectedDate,
    showTasks,
    suggestedReplies,
    generateSuggestedReplies,
    clearSuggestedReplies,
  } = useChatStore();
  const {
    activeModel,
    isModelLoading,
    setIsSettingsOpen,
    isSuggestedRepliesEnabled,
  } = useOllamaStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(morningIntentionMessage);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  const currentDateChats = chats[selectedDate] || [];
  const currentChat = currentDateChats.find(
    (chat) => chat.id === currentChatId,
  );
  const messages = currentChat?.messages || [];

  const startConversation = useCallback(
    async (persona: string, chatType: "morning" | "evening" | "general") => {
      setIsStartingConversation(true);
      setIsLoading(true);

      const currentChatId = currentChat?.id;

      if (!currentChatId) {
        console.error("No current chat found");
        setIsLoading(false);
        setIsStartingConversation(false);
        return;
      }

      const hiddenUserMessage: Message = {
        role: "user",
        content: "Please start the session",
        hidden: true,
      };
      try {
        if (!activeModel) {
          throw new Error("No active model selected");
        }
        const response = await ollama.chat({
          model: activeModel,
          messages: [{ role: "system", content: persona }, hiddenUserMessage],
          stream: true,
          options: { num_ctx: 4096 },
        });
        addMessage(hiddenUserMessage);
        let assistantContent = "";

        for await (const part of response) {
          assistantContent += part.message.content;
          updateCurrentChat([
            hiddenUserMessage,
            { role: "assistant", content: assistantContent },
          ]);
          // Set isStartingConversation to false after the first part of the response
          if (isStartingConversation) {
            setIsStartingConversation(false);
          }
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
        addMessage({
          role: "assistant",
          content: "An error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
        setIsStartingConversation(false);
      }
    },
    [
      activeModel,
      currentChat,
      addMessage,
      updateCurrentChat,
      isStartingConversation,
    ],
  );

  const handleSubmit = useCallback(
    async (input: string) => {
      const userMessage: Message = { role: "user", content: input };
      addMessage(userMessage);
      setIsLoading(true);

      try {
        if (!activeModel) {
          throw new Error("No active model selected");
        }
        const response = await ollama.chat({
          model: activeModel,
          messages: [
            { role: "system", content: currentPersona },
            ...messages,
            userMessage,
          ],
          stream: true,
          options: { num_ctx: 4096 },
        });

        let assistantContent = "";

        for await (const part of response) {
          assistantContent += part.message.content;
          updateCurrentChat([
            ...messages,
            userMessage,
            { role: "assistant", content: assistantContent },
          ]);
        }
        clearSuggestedReplies(currentChatId || "");
      } catch (error) {
        console.error("Error in chat:", error);
        addMessage({
          role: "assistant",
          content: "An error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
        // Only generate suggested replies if the feature is enabled
        if (isSuggestedRepliesEnabled) {
          generateSuggestedReplies(currentChatId || "");
        }
      }
    },
    [
      messages,
      addMessage,
      updateCurrentChat,
      activeModel,
      currentPersona,
      clearSuggestedReplies,
      generateSuggestedReplies,
      currentChatId,
      isSuggestedRepliesEnabled,
    ],
  );

  const handleClearChat = useCallback(() => {
    clearCurrentChat();
  }, [clearCurrentChat]);

  const handleDeleteChat = useCallback(() => {
    if (currentChatId && currentChat?.type === "general") {
      deleteChat(currentChatId);
      const remainingChats = currentDateChats.filter(
        (chat) => chat.id !== currentChatId,
      );
      if (remainingChats.length > 0) {
        setCurrentChat(remainingChats[0].id);
      } else {
        setCurrentChat("");
      }
    }
  }, [
    currentChatId,
    currentChat,
    deleteChat,
    currentDateChats,
    setCurrentChat,
  ]);

  const handleStartSession = useCallback(() => {
    if (currentChat) {
      const persona =
        currentChat.type === "morning"
          ? morningIntentionMessage
          : eveningReflectionMessage;
      startConversation(persona, currentChat.type);
    }
  }, [currentChat, startConversation]);

  const memoizedChatMessages = useMemo(
    () => <ChatMessages messages={messages} isLoading={isLoading} />,
    [messages, isLoading],
  );

  const getChatTitle = (chat: Chat | undefined) => {
    if (!chat) return "AI Assistant";
    switch (chat.type) {
      case "morning":
        return "Morning Intention";
      case "evening":
        return "Evening Reflection";
      default:
        return "General Chat";
    }
  };

  const handleSuggestedReplyClick = useCallback(
    (reply: string) => {
      handleSubmit(reply);
      clearSuggestedReplies(currentChatId || "");
    },
    [handleSubmit, clearSuggestedReplies, currentChatId],
  );

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
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">
          No model is currently active. Please select a model in Settings to
          start chatting.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">
          {format(parseISO(selectedDate), "MMMM d, yyyy")}{" "}
        </h2>
        <h2 className="text-xl font-semibold">
          {showTasks ? "Focus" : getChatTitle(currentChat)}
        </h2>
        <div className="flex items-center space-x-2">
          {!showTasks && currentChat && (
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={messages.length <= 1 || isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
              {currentChat.type === "general" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteChat}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Delete Chat
                </Button>
              )}
            </div>
          )}
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
      {showTasks ? (
        <ScrollArea className="flex-1 h-full p-4">
          <div className="flex flex-col max-w-2xl w-full mx-auto">
            <PomodoroTimer />
            <hr />
            <TaskList />
            <NotePad />
          </div>
        </ScrollArea>
      ) : (
        <>
          {!currentChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const newChatId = addChat("general");
                    setCurrentChat(newChatId);
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              {currentChat.messages.length === 0 &&
                (currentChat.type === "morning" ||
                  currentChat.type === "evening") && (
                  <div className="flex justify-center items-center p-4">
                    <Button
                      onClick={handleStartSession}
                      disabled={isStartingConversation}
                    >
                      {isStartingConversation ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start{" "}
                      {currentChat.type === "morning" ? "Morning" : "Evening"}{" "}
                      Session
                    </Button>
                  </div>
                )}
              <div className="flex-1 overflow-hidden">
                {memoizedChatMessages}
              </div>
              {isSuggestedRepliesEnabled &&
                (currentChat.isSuggestedRepliesLoading ? (
                  <div className="flex justify-center items-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">
                      Loading suggestions...
                    </span>
                  </div>
                ) : (
                  currentChat.suggestedReplies &&
                  currentChat.suggestedReplies.length > 0 && (
                    <div className="flex flex-row flex-wrap p-2 gap-2">
                      {currentChat.suggestedReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedReplyClick(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )
                ))}
              <ChatInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                chatId={currentChatId || ""}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
