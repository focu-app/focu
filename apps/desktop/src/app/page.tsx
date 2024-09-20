"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Play, Trash2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import ollama from "ollama/browser";

import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

import {
  AppDropdownMenu,
  openSettingsWindow,
} from "./_components/AppDropdownMenu";
import { CommandMenu } from "./_components/CommandMenu";
import { ChatInput } from "./_components/ChatInput";
import { ChatMessages } from "./_components/ChatMessages";
import { ChatSidebar } from "./_components/ChatSidebar";
import { TaskList } from "./_components/TaskList";
import PomodoroTimer from "./tray/PomodoroTimer";

import { useOllamaStoreShallow } from "./store";
import { type Chat, type Message, useChatStore } from "./store/chatStore";
import {
  eveningReflectionMessage,
  morningIntentionMessage,
} from "../lib/persona";

export default function Home() {
  const {
    activeModel,
    isModelLoading,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
  } = useOllamaStoreShallow();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

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
      addChat("general");
    }
  }, [chats, addChat]);

  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    const { invoke } = await import("@tauri-apps/api/tauri");

    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
  }, []);

  const shortcuts = useMemo(
    () => [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: openSettingsWindow },
    ],
    [],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.key === event.key && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          shortcut.action();
        }
      }

      if (event.key === "Escape") {
        if (isCommandMenuOpen) {
          setIsCommandMenuOpen(false);
        } else {
          closeMainWindow();
        }
      }
    },
    [closeMainWindow, isCommandMenuOpen, shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    initializeApp();
    registerGlobalShortcut();
    return () => {
      unregisterGlobalShortcut();
    };
  }, [initializeApp, registerGlobalShortcut, unregisterGlobalShortcut]);

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
    [activeModel, currentChat, addMessage, updateCurrentChat],
  );

  const handleSubmit = useCallback(
    async (input: string) => {
      const userMessage: Message = { role: "user", content: input };
      addMessage(userMessage);
      setIsLoading(true);

      try {
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
    [messages, addMessage, updateCurrentChat, activeModel, currentPersona],
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

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {isModelLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        ) : activeModel ? (
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
                  <AppDropdownMenu />
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                {showTasks ? (
                  <ScrollArea className="flex-1 h-full p-4">
                    <div className="flex flex-col max-w-2xl w-full mx-auto">
                      <PomodoroTimer />
                      <hr />
                      <TaskList />
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
                        <ChatInput
                          onSubmit={handleSubmit}
                          isLoading={isLoading}
                          chatId={currentChatId || ""}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">
              No model is currently active. Please select a model in Settings to
              start chatting.
            </p>
          </div>
        )}
      </div>
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
    </div>
  );
}
