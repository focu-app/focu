"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ollama from "ollama/browser";
import { Button } from "@repo/ui/components/ui/button";
import { Trash2, XCircle, FileText, MessageSquare } from "lucide-react";
import { useChatStore, type Message } from "./store/chatStore";
import { ChatSidebar } from "./_components/ChatSidebar";
import { ChatMessages } from "./_components/ChatMessages";
import { ChatInput } from "./_components/ChatInput";
import { ChatSummary } from "./_components/ChatSummary";
import {
  morningIntentionMessage,
  eveningReflectionMessage,
} from "../lib/persona";
import { Sun, Moon } from "lucide-react";
import { TaskList } from "./_components/TaskList";

interface ChatProps {
  model: string;
}

export default function Chat({ model }: ChatProps) {
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

  useEffect(() => {
    if (Object.keys(chats).length === 0) {
      addChat();
    }
  }, [chats, addChat]);

  const startConversation = useCallback(
    async (persona: string, chatType: "morning" | "evening" | "general") => {
      setIsLoading(true);
      const newChatId = addChat(chatType);
      setCurrentChat(newChatId);

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
    [model, addChat, setCurrentChat, addMessage, updateCurrentChat],
  );

  const handleMorningIntention = useCallback(() => {
    setCurrentPersona(morningIntentionMessage);
    startConversation(morningIntentionMessage, "morning");
  }, [startConversation]);

  const handleEveningReflection = useCallback(() => {
    setCurrentPersona(eveningReflectionMessage);
    startConversation(eveningReflectionMessage, "evening");
  }, [startConversation]);

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
    if (currentChatId) {
      deleteChat(currentChatId);
      if (currentDateChats.length > 1) {
        const newCurrentChatId = currentDateChats.find(
          (chat) => chat.id !== currentChatId,
        )?.id;
        if (newCurrentChatId) setCurrentChat(newCurrentChatId);
      } else {
        addChat();
      }
    }
  }, [currentChatId, deleteChat, currentDateChats, setCurrentChat, addChat]);

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

  const memoizedChatMessages = useMemo(
    () => <ChatMessages messages={messages} isLoading={isLoading} />,
    [messages, isLoading],
  );

  const memoizedChatInput = useMemo(
    () => <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />,
    [handleSubmit, isLoading],
  );

  const chatHasStarted = messages.length > 1;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <ChatSidebar
        onSelectTasks={handleSelectTasks}
        onSelectChat={handleSelectChat}
        onStartMorningIntention={handleMorningIntention}
        onStartEveningReflection={handleEveningReflection}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {showTasks ? "Task List" : "AI Assistant"}
          </h2>
          {!showTasks && (
            <div className="space-x-2">
              {currentChat?.summary ? (
                <ChatSummary summary={currentChat.summary} />
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteChat}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Delete Chat
              </Button>
            </div>
          )}
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
                      onClick={handleMorningIntention}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Start Morning Intention
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleEveningReflection}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Start Evening Reflection
                    </Button>
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
