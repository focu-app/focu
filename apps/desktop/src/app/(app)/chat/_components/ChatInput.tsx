import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useWindowFocus } from "@/app/hooks/useWindowFocus";
import { useChatStore } from "@/app/store/chatStore";

interface ChatInputProps {
  disabled: boolean;
  chatId: string;
}

export function ChatInput({ disabled, chatId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendChatMessage, isLoading } = useChatStore();

  useEffect(() => {
    if (textareaRef.current && chatId) {
      textareaRef.current.focus();
    }
  }, [chatId]);

  useWindowFocus(() => {
    textareaRef.current?.focus();
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendChatMessage(Number(chatId), input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none"
          placeholder="Type your message..."
          disabled={disabled || isLoading}
          rows={2}
        />
        <Button type="submit" disabled={disabled || isLoading}>
          Send
        </Button>
      </div>
    </form>
  );
}

ChatInput.displayName = "ChatInput";
