"use client";

import { Button } from "@repo/ui/components/ui/button";
import { format, parseISO } from "date-fns";
import { FileText, MessageSquare, Trash2, XCircle } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { Play } from "lucide-react"; // Add this import
import ollama from "ollama/browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  eveningReflectionMessage,
  morningIntentionMessage,
} from "../lib/persona";
import { AppDropdownMenu } from "./_components/AppDropdownMenu";
import { ChatInput } from "./_components/ChatInput";
import { ChatMessages } from "./_components/ChatMessages";
import { ChatSidebar } from "./_components/ChatSidebar";
import { ChatSummary } from "./_components/ChatSummary";
import { TaskList } from "./_components/TaskList";
import { type Chat, type Message, useChatStore } from "./store/chatStore";
import { useTaskStore } from "./store/taskStore";

interface ChatProps {
  model: string;
}

export default function ChatComponent({ model }: ChatProps) {
  const {
    chats,
    currentChatId,
    addChat,
    setCurrentChat,
    addMessage,
    clearCurrentChat,
    updateCurrentChat,
    deleteChat,
    summarizeCurrentChat,
    selectedDate,
  } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(morningIntentionMessage);
  const [showTasks, setShowTasks] = useState(false);

  const currentDateChats = chats[selectedDate] || [];
  const currentChat = currentDateChats.find(
    (chat) => chat.id === currentChatId,
  );
  const messages = currentChat?.messages || [];

  const { setSelectedDate: setSelectedTaskDate } = useTaskStore();

  useEffect(() => {
    if (Object.keys(chats).length === 0) {
      addChat("general");
    }
  }, [chats, addChat]);

  useEffect(() => {
    setSelectedTaskDate(selectedDate);
  }, [selectedDate, setSelectedTaskDate]);

  const startConversation = useCallback(
    async (persona: string, chatType: "morning" | "evening" | "general") => {
      setIsLoading(true);

      const currentChatId = currentChat?.id;

      if (!currentChatId) {
        console.error("No current chat found");
        setIsLoading(false);
        return;
      }

      const hiddenUserMessage: Message = {
        role: "user",
        content: "Please start the session",
        hidden: true,
      };
      try {
        const response = await ollama.chat({
          model,
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
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
        addMessage({
          role: "assistant",
          content: "An error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [model, currentChat, addMessage, updateCurrentChat],
  );

  const handleSubmit = useCallback(
    async (input: string) => {
      const userMessage: Message = { role: "user", content: input };
      addMessage(userMessage);
      setIsLoading(true);

      try {
        const response = await ollama.chat({
          model,
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
      } catch (error) {
        console.error("Error in chat:", error);
        addMessage({
          role: "assistant",
          content: "An error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage, updateCurrentChat, model, currentPersona],
  );

  const handleClearChat = useCallback(() => {
    clearCurrentChat();
  }, [clearCurrentChat]);

  const handleDeleteChat = useCallback(() => {
    if (currentChatId && currentChat?.type === "general") {
      deleteChat(currentChatId);
      // After deleting, select the first available chat or set to null if none exist
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

  const handleSummarize = useCallback(() => {
    summarizeCurrentChat();
  }, [summarizeCurrentChat]);

  const handleSelectTasks = useCallback(() => {
    setShowTasks(true);
  }, []);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setCurrentChat(chatId);
      setShowTasks(false);
    },
    [setCurrentChat],
  );

  const handleMorningIntention = useCallback(() => {
    const morningChat = currentDateChats.find(
      (chat) => chat.type === "morning",
    );
    if (morningChat) {
      setCurrentChat(morningChat.id);
    } else {
      const newChatId = addChat("morning");
      setCurrentChat(newChatId);
    }
    setCurrentPersona(morningIntentionMessage);
    setShowTasks(false);
  }, [currentDateChats, setCurrentChat, addChat]);

  const handleEveningReflection = useCallback(() => {
    const eveningChat = currentDateChats.find(
      (chat) => chat.type === "evening",
    );
    if (eveningChat) {
      setCurrentChat(eveningChat.id);
    } else {
      const newChatId = addChat("evening");
      setCurrentChat(newChatId);
    }
    setCurrentPersona(eveningReflectionMessage);
    setShowTasks(false);
  }, [currentDateChats, setCurrentChat, addChat]);

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

  const memoizedChatInput = useMemo(
    () => <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />,
    [handleSubmit, isLoading],
  );

  const chatHasStarted = messages.length > 1;

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

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <ChatSidebar
        onSelectTasks={handleSelectTasks}
        onSelectChat={handleSelectChat}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(parseISO(selectedDate), "MMMM d, yyyy")}{" "}
          </h2>
          <h2 className="text-xl font-semibold">
            {showTasks ? "Task List" : getChatTitle(currentChat)}
          </h2>
          <div className="flex items-center space-x-2">
            {!showTasks && currentChat && (
              <div className="space-x-2">
                {currentChat.summary ? (
                  <ChatSummary />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={messages.length <= 1 || isLoading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Summarize
                  </Button>
                )}
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
            <AppDropdownMenu />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {showTasks ? (
            <TaskList />
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
                        <Button onClick={handleStartSession}>
                          <Play className="h-4 w-4 mr-2" />
                          Start{" "}
                          {currentChat.type === "morning"
                            ? "Morning"
                            : "Evening"}{" "}
                          Session
                        </Button>
                      </div>
                    )}
                  <div className="flex-1 overflow-hidden">
                    {memoizedChatMessages}
                  </div>
                  {memoizedChatInput}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
