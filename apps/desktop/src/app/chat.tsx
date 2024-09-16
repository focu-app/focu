"use client";

import { useState, useEffect, useRef } from "react";
import ollama from "ollama/browser";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2, Trash2, XCircle } from "lucide-react";
import Markdown from "react-markdown";
import { useChatStore, type Message } from "./store/chatStore";
import { ChatSidebar } from "./_components/ChatSidebar";

const systemMessage = `# AI Persona: Flo, Your Adaptive Focus Assistant
Your AI-powered productivity companion. My purpose is to help you navigate your day with intention, focus, and reflection. I'm here to support you in achieving your goals, big and small, while adapting to your unique work style and needs.

## My Personality:
- Friendly and approachable, but professionally focused
- Encouraging and positive, without being overly cheerful
- Adaptive to your mood and energy levels
- Direct when needed, but always respectful
- Curious about your work and goals

## My Knowledge Base:
- Productivity techniques and time management strategies
- Task breakdown and prioritization methods
- Mindfulness and focus-enhancing practices
- Basic psychology of motivation and habit formation

## Our Interactions:
1. I'll always start by asking what you'd like to focus on
2. I'll ask clarifying questions to ensure I understand your needs
3. I'll provide the specific assistance you request
4. I won't make assumptions or provide unsolicited advice, only when asked

Our chats start with Morning Planning:
- I'll greet you warmly and inquire about your state of mind, I will keep my messages short and to the point.
- I will guide you through 1) gratitude, 2) intention-setting, 3) anticipating challenges, I will do this one message at a time.
- Help extract and organize tasks for the day

Questions for Morning Planning:
- What are you grateful for this morning?
- What are your intentions for today?
- Can you anticipate any challenges today?

## My Limitations:
- I don't have access to external tools or websites
- I can't make changes to your device or other applications
- My knowledge is based on my training, not real-time information`;

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
    deleteChat, // Add this
  } = useChatStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    if (chats.length === 0) {
      addChat();
    }
  }, [chats.length, addChat]);

  useEffect(() => {
    if (currentChat && messages.length === 0) {
      addMessage({ role: "system", content: systemMessage });
    }
  }, [currentChat, messages.length, addMessage]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
  }, [messages]);

  const startConversation = async () => {
    setIsLoading(true);
    const hiddenUserMessage: Message = {
      role: "user",
      content: "Please start the Morning Check-in",
      hidden: true,
    };
    try {
      const response = await ollama.chat({
        model,
        messages: [
          { role: "system", content: systemMessage },
          hiddenUserMessage,
        ],
        stream: true,
        options: { num_ctx: 4096 },
      });
      addMessage(hiddenUserMessage);
      const assistantMessage: Message = { role: "assistant", content: "" };
      addMessage(assistantMessage);

      for await (const part of response) {
        assistantMessage.content += part.message.content;
        updateCurrentChat([
          ...messages,
          hiddenUserMessage,
          { ...assistantMessage },
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ollama.chat({
        model,
        messages: [...messages, userMessage],
        stream: true,
        options: { num_ctx: 4096 },
      });
      const assistantMessage: Message = { role: "assistant", content: "" };
      addMessage(assistantMessage);

      for await (const part of response) {
        assistantMessage.content += part.message.content;
        updateCurrentChat([...messages, userMessage, { ...assistantMessage }]);
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
  };

  const handleClearChat = () => {
    clearCurrentChat();
    setInput("");
  };

  const handleDeleteChat = () => {
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
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Morning Check-in</h2>
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
        <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
          {messages.length === 1 && (
            <div className="flex justify-center items-center h-full">
              <Button onClick={startConversation} disabled={isLoading}>
                Start Morning Check-in
              </Button>
            </div>
          )}
          {messages
            .filter((message) => message.role !== "system" && !message.hidden)
            .map((message, index) => (
              <Card
                key={index}
                className={`mb-4 ${
                  message.role === "user" ? "ml-auto" : "mr-auto"
                } max-w-[80%]`}
              >
                <CardContent
                  className={`p-3 ${
                    message.role === "user" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Markdown>{message.content}</Markdown>
                </CardContent>
              </Card>
            ))}
          {isLoading && (
            <div className="text-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 mr-2"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
