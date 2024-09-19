import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

// Add this interface to define the ref methods
export interface ChatInputRef {
  focus: () => void;
}

interface ChatInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  chatId?: string;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ onSubmit, isLoading, chatId }, ref) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Expose the focus method via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    useEffect(() => {
      if (textareaRef.current && chatId) {
        textareaRef.current.focus();
      }
    }, [chatId]);

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
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none"
            placeholder="Type your message..."
            disabled={isLoading}
            autoFocus
            rows={2}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    );
  },
);

ChatInput.displayName = "ChatInput";
