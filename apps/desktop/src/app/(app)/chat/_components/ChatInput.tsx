import { useWindowFocus } from "@/app/hooks/useWindowFocus";
import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface ChatInputProps {
  disabled: boolean;
  chatId: number;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ chatId, disabled }, ref) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { sendChatMessage } = useChatStore();
    const { isOllamaRunning } = useOllamaStore();

    useWindowFocus(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      sendChatMessage(Number(chatId), input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSubmit(e);
      }
    };

    const adjustTextareaHeight = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      adjustTextareaHeight();
    };

    useEffect(() => {
      adjustTextareaHeight();
    }, [adjustTextareaHeight]);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    return (
      <form onSubmit={onSubmit} className="flex flex-row items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none overflow-y-auto"
          placeholder="Type your message..."
          disabled={disabled || !isOllamaRunning}
          rows={3}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={disabled || !isOllamaRunning}
              className="z-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>⌘+Enter to send</p>
          </TooltipContent>
        </Tooltip>
      </form>
    );
  },
);

ChatInput.displayName = "ChatInput";
