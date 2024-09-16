import { useRef, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { Message } from "../store/chatStore";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onStartConversation: () => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onStartConversation,
}: ChatMessagesProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
      {messages.length === 1 && (
        <div className="flex justify-center items-center h-full">
          <Button onClick={onStartConversation} disabled={isLoading}>
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
  );
}
