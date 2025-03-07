"use client";
import type { FileMessage } from "@/database/file-types";
import { useWindowFocus } from "@/hooks/useWindowFocus";
import { useFileChatStore } from "@/store/fileChatStore";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useToast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { Check, Copy, Loader2, Trash2, RefreshCw } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Markdown from "react-markdown";
import * as fileChatManager from "@/database/file-chat-manager";

interface FileChatMessagesProps {
  messages: FileMessage[];
}

const MessageItem = memo(
  ({
    message,
    isPending,
    isLastMessage,
    onCopy,
    onDelete,
    onRegenerate,
  }: {
    message: FileMessage;
    isPending: boolean;
    isLastMessage: boolean;
    onCopy: (text: string) => void;
    onDelete: (messageId: number) => void;
    onRegenerate?: () => void;
  }) => {
    const [hasCopied, setHasCopied] = useState(false);
    const formattedDate = message.createdAt
      ? new Date(message.createdAt).toLocaleTimeString()
      : "";

    const handleCopy = async () => {
      try {
        await onCopy(message.text);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 1500);
      } catch (err) {
        console.error("Failed to copy message");
      }
    };

    const handleDelete = async () => {
      if (message.id) {
        await onDelete(message.id);
      }
    };

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

        <div
          className={cn("prose dark:prose-invert max-w-none relative group")}
        >
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
          <div className="flex justify-between">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <div />
            )}
            <div className="flex items-center">
              {isLastMessage && message.role === "assistant" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onRegenerate}
                      className="p-2 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label="Regenerate response"
                      disabled={isPending}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate response</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {isLastMessage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-2 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      aria-label="Delete message"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete message</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "p-2 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50",
                      isLastMessage
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                    aria-label={hasCopied ? "Copied" : "Copy message"}
                    disabled={isPending}
                  >
                    {hasCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasCopied ? "Copied!" : "Copy message"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export const FileChatMessages = memo(function FileChatMessages({
  messages,
}: FileChatMessagesProps) {
  const { isLoading } = useFileChatStore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(
    (message) => message.role !== "system" && !message.hidden,
  );

  const lastMessage = filteredMessages.at(-1);
  const lastUserMessage = [...filteredMessages]
    .reverse()
    .find((m) => m.role === "user");

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Message copied",
      description: "The message has been copied to your clipboard.",
    });
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      // Call the file chat manager to delete the message
      await fileChatManager.deleteMessage(messageId);
      toast({
        title: "Message deleted",
        description: "The message has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete the message.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateMessage = async () => {
    if (!lastUserMessage) return;

    try {
      // Delete the last assistant message if present
      if (lastMessage && lastMessage.role === "assistant") {
        await fileChatManager.deleteMessage(lastMessage.id);
      }

      // Regenerate response using the last user message
      // In a real implementation, this would re-send to the AI
      toast({
        title: "Regenerating response",
        description: "Regenerating the assistant's response...",
      });

      // In a real implementation, this would call the proper API
      // For now, we'll just add a placeholder message
      const assistantMessage = {
        text: `Regenerated response to: ${lastUserMessage.text}`,
        role: "assistant" as const,
        chatId: lastUserMessage.chatId,
      };

      await fileChatManager.addMessage(assistantMessage);

      toast({
        title: "Response regenerated",
        description: "The assistant's response has been regenerated.",
      });
    } catch (error) {
      console.error("Error regenerating message:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate the response.",
        variant: "destructive",
      });
    }
  };

  // Add keyboard shortcut for copy
  useHotkeys(
    "mod+shift+c",
    async () => {
      if (lastMessage?.text) {
        await handleCopy(lastMessage.text);
      }
    },
    {
      enabled: !!lastMessage && lastMessage === filteredMessages.at(-1),
      enableOnFormTags: true,
    },
    [lastMessage, filteredMessages],
  );

  // Add keyboard shortcut for regenerate
  useHotkeys(
    "mod+shift+r",
    async () => {
      if (lastMessage?.role === "assistant") {
        await handleRegenerateMessage();
      }
    },
    {
      enabled: !!lastMessage && lastMessage.role === "assistant",
      enableOnFormTags: true,
    },
    [lastMessage],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useWindowFocus(() => {
    setTimeout(scrollToBottom, 100);
  });

  // Scroll when messages change
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  if (filteredMessages.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
      <div className="flex flex-col gap-4 p-4 min-h-full max-w-4xl mx-auto">
        {filteredMessages.map((message, index) => {
          const isPending =
            isLoading &&
            message.role === "assistant" &&
            index === filteredMessages.length - 1;
          const isLastMessage = index === filteredMessages.length - 1;
          return (
            <MessageItem
              key={message.id || index}
              message={message}
              isPending={isPending}
              isLastMessage={isLastMessage}
              onCopy={handleCopy}
              onDelete={handleDeleteMessage}
              onRegenerate={handleRegenerateMessage}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

FileChatMessages.displayName = "FileChatMessages";
