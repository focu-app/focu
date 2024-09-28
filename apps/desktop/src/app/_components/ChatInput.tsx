import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useWindowFocus } from "../hooks/useWindowFocus";

interface ChatInputProps {
  onSubmit: (input: string) => void;
  disabled: boolean;
  chatId?: string;
}

export function ChatInput({ onSubmit, disabled, chatId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && chatId) {
      textareaRef.current.focus();
    }
  }, [chatId]);

  useWindowFocus(() => {
    textareaRef.current?.focus();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // biome-ignore lint: we want to resize the textarea when the input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none"
          placeholder="Type your message..."
          disabled={disabled}
          rows={2}
        />
        <Button type="submit" disabled={disabled}>
          Send
        </Button>
      </div>
    </form>
  );
}

ChatInput.displayName = "ChatInput";
