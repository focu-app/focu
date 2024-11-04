"use client";
import { useWindowFocus } from "@/app/hooks/useWindowFocus";
import { useChatStore } from "@/app/store/chatStore";
import type { Message } from "@/database/db";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { Loader2 } from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import Markdown from "react-markdown";

interface ChatMessagesProps {
  messages: Message[];
}

const MessageItem = memo(
  ({ message, isPending }: { message: Message; isPending: boolean }) => {
    const formattedDate = message.createdAt
      ? new Date(message.createdAt).toLocaleTimeString()
      : "";

    return (
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-left gap-2 text-sm text-muted-foreground mb-1">
          {message.role === "user" ? (
            <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-full w-full text-gray-300 dark:text-gray-700"
              >
                <title>You</title>
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-medium text-secondary">F</span>
            </span>
          )}
          <span className="text-md font-semibold">
            {message.role === "user" ? "You" : "Focu"}
          </span>
          <span className="text-xs ml-2">{formattedDate}</span>
        </div>

        <div className={cn("prose dark:prose-invert max-w-none")}>
          <Markdown
            components={{
              p: ({ children }) => <p className="my-2">{children}</p>,
              br: () => <br />,
              ul: ({ children }) => (
                <ul className="list-disc pl-8">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-8">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-2">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-muted pl-4 italic">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-2" />,
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="mb-2" />
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline">
                  {children}
                </a>
              ),
            }}
          >
            {message.text}
          </Markdown>
          {isPending && (
            <div className="flex items-center mt-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const ChatMessages = memo(function ChatMessages({
  messages,
}: ChatMessagesProps) {
  const { replyLoading } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter(
    (message) => message.role !== "system" && !message.hidden,
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useWindowFocus(() => {
    setTimeout(scrollToBottom, 100);
  });

  // biome-ignore lint: we want to scroll down when messages changes
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom, messages]);

  if (filteredMessages.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4 min-h-full max-w-4xl mx-auto">
        {filteredMessages.map((message, index) => {
          const isPending =
            replyLoading &&
            message.role === "assistant" &&
            index === filteredMessages.length - 1;
          return (
            <MessageItem key={index} message={message} isPending={isPending} />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});
