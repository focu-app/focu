import { useRef, useLayoutEffect, memo, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import type { Message } from "../store/chatStore";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageItem = memo(({ message }: { message: Message }) => (
  <Card
    className={`mb-4 ${
      message.role === "user" ? "ml-auto" : "mr-auto"
    } max-w-[80%] relative`}
  >
    <CardContent
      className={`p-3 ${
        message.role === "user" ? "bg-blue-100" : "bg-gray-100"
      }`}
    >
      <Markdown>{message.content}</Markdown>
    </CardContent>
  </Card>
));

export const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter(
    (message) => message.role !== "system" && !message.hidden,
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, filteredMessages]);

  if (filteredMessages.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 h-full p-4" ref={scrollAreaRef}>
      <div className="flex flex-col min-h-full">
        {filteredMessages.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});
