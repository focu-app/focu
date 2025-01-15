import { useWindowFocus } from "@/app/hooks/useWindowFocus";
import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Send, Settings2 } from "lucide-react";
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
import { ModelSelector } from "@/app/_components/ModelSelector";

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
    const { showSettings, setShowSettings } = useChatStore();

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
      <div className="flex flex-col rounded-md border border-input bg-background">
        <form onSubmit={onSubmit} className="flex flex-row items-start">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none overflow-y-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Type your message..."
            disabled={disabled || !isOllamaRunning}
            rows={3}
          />
          <div className="flex flex-col space-y-2 m-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || !isOllamaRunning}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>⌘+Enter to send</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
        {showSettings && (
          <div className="flex flex-row space-x-4 px-3 py-2 min-h-[60px]">
            <ModelSelector
              chatId={chatId}
              showLabel={false}
              className="w-[200px]"
            />
          </div>
        )}
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
