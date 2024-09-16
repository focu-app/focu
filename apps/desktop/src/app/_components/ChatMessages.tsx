import { useRef, useEffect, memo, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import type { Message } from "../store/chatStore";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onStartConversation: () => void;
}

const MessageItem = memo(({ message }: { message: Message }) => (
  <Card
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
));

export const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  onStartConversation,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter(
    (message) => message.role !== "system" && !message.hidden,
  );

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      {messages.length === 1 ? (
        <div className="flex justify-center items-center h-full">
          <Button onClick={onStartConversation} disabled={isLoading}>
            Start Morning Check-in
          </Button>
        </div>
      ) : (
        filteredMessages.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))
      )}
      {isLoading && (
        <div className="text-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </ScrollArea>
  );
});
