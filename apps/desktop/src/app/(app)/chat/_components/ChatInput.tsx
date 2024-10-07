import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useWindowFocus } from "@/app/hooks/useWindowFocus";
import { useChatStore } from "@/app/store/chatStore";

interface ChatInputProps {
  disabled: boolean;
  chatId: number;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ chatId, disabled }, ref) => {
    const [input, setInput] = useState("");
    const { sendChatMessage } = useChatStore();

    useWindowFocus(() => {
      if (ref && "current" in ref) {
        ref.current?.focus();
      }
    });

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
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
      if (ref && "current" in ref) {
        const textarea = ref.current;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }
    }, [ref]);

    return (
      <form onSubmit={onSubmit}>
        <div className="flex items-end">
          <Textarea
            ref={ref}
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
  },
);

ChatInput.displayName = "ChatInput";
