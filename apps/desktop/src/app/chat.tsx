"use client";

import { useState, useEffect, useRef } from "react";
import ollama from "ollama/browser";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2, Trash2, PlusCircle, MessageSquare } from "lucide-react";
import Markdown from "react-markdown";
import { useChatStore, Message, Chat as ChatType } from "./store/chatStore";

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

  const handleNewChat = () => {
    addChat();
  };

  const handleClearChat = () => {
    clearCurrentChat();
    setInput("");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button className="w-full" onClick={handleNewChat}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {chats
            .sort((a, b) => Number(b.id) - Number(a.id))
            .map((chat) => (
              <div
                key={chat.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  chat.id === currentChatId ? "bg-gray-200" : ""
                }`}
                onClick={() => setCurrentChat(chat.id)}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <div className="truncate">
                    {chat.messages.length > 1
                      ? `${chat.messages[1].content.substring(0, 20)}...`
                      : "New Chat"}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(chat.createdAt)}
                </div>
              </div>
            ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Morning Check-in</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length <= 1 || isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
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
