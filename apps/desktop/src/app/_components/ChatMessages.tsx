"use client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Markdown from "react-markdown";
import type { Message } from "../store/chatStoreOld";
import { useWindowFocus } from "../hooks/useWindowFocus";
import { cn } from "@repo/ui/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageItem = memo(({ message }: { message: Message }) => (
  <Card
    className={cn(
      "mb-4",
      message.role === "user" ? "ml-auto" : "mr-auto",
      message.role === "user"
        ? "bg-blue-100 dark:bg-blue-900"
        : "bg-gray-100 dark:bg-gray-900",
      "max-w-[80%] relative",
    )}
  >
    <CardContent className={cn("p-3")}>
      <Markdown
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          br: () => <br />,
          ul: ({ children }) => <ul className="list-disc pl-8">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal pl-8">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-2">{children}</blockquote>
          ),
          hr: () => <hr className="my-2" />,
          img: ({ src, alt }) => <img src={src} alt={alt} className="mb-2" />,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-500">
              {children}
            </a>
          ),
        }}
      >
        {message?.content?.replace(/\n/g, "  \n")}
      </Markdown>
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

  console.log("messages", messages);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useWindowFocus(() => {
    setTimeout(scrollToBottom, 100);
  });

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom, messages]);

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
