"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ollama from "ollama/browser";
import { Button } from "@repo/ui/components/ui/button";
import { Trash2, XCircle, FileText } from "lucide-react";
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
  } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(morningIntentionMessage);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    if (chats.length === 0) {
      addChat();
    }
  }, [chats.length, addChat]);

  const startConversation = useCallback(
    async (persona: string) => {
      setIsLoading(true);
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
            ...messages,
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
    [model, messages, addMessage, updateCurrentChat],
  );

  const handleMorningIntention = useCallback(() => {
    setCurrentPersona(morningIntentionMessage);
    clearCurrentChat();
    startConversation(morningIntentionMessage);
  }, [clearCurrentChat, startConversation]);

  const handleEveningReflection = useCallback(() => {
    setCurrentPersona(eveningReflectionMessage);
    clearCurrentChat();
    startConversation(eveningReflectionMessage);
  }, [clearCurrentChat, startConversation]);

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
      if (chats.length > 1) {
        const newCurrentChatId = chats.find(
          (chat) => chat.id !== currentChatId,
        )?.id;
        if (newCurrentChatId) setCurrentChat(newCurrentChatId);
      } else {
        addChat();
      }
    }
  }, [currentChatId, deleteChat, chats, setCurrentChat, addChat]);

  const handleSummarize = useCallback(() => {
    summarizeCurrentChat();
  }, [summarizeCurrentChat]);

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
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">AI Assistant</h2>
          <div className="space-x-2">
            {currentChat?.summary ? (
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
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {!chatHasStarted ? (
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
        </div>
      </div>
    </div>
  );
}
