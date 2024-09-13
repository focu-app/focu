"use client";

import { useState, useEffect, useRef } from "react";
import ollama from "ollama/browser";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

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
- I'll greet you warmly and inquire about your state of mind
- Guide you through gratitude, intention-setting, and anticipating challenges
- Help extract and organize tasks for the day

Questions for Morning Planning:
- What are you grateful for this morning?
- What are your intentions for today?
- Can you anticipate any challenges today?

## My Limitations:
- I don't have access to external tools or websites
- I can't make changes to your device or other applications
- My knowledge is based on my training, not real-time information`;

export default function Chat({ model }: { model: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [{ role: "system", content: systemMessage }],
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ollama.chat({
        model,
        messages: [...messages, userMessage],
        stream: true,
        options: { num_ctx: 4096 },
      });
      let assistantMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      for await (const part of response) {
        assistantMessage.content += part.message.content;
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? assistantMessage : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        {messages
          .filter((message) => message.role !== "system")
          .map((message, index) => (
            <Card
              key={index}
              className={`mb-4 ${message.role === "user" ? "ml-auto" : "mr-auto"} max-w-[80%]`}
            >
              <CardContent
                className={`p-3 ${message.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}
              >
                {message.content}
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
  );
}
