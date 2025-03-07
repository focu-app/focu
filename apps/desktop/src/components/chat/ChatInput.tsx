import { ModelSelector } from "@/components/models/ModelSelector";
import { getChat } from "@/database/chats";
import { useWindowFocus } from "@/hooks/useWindowFocus";
import { useChatStore } from "@/store/chatStore";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { Send, Settings2 } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { isAnyDialogOpenInDOM } from "../shortcuts/Shortcuts";

interface ChatInputProps {
  disabled: boolean;
  chatId: number;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ chatId, disabled }, ref) => {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { sendChatMessage } = useChatStore();
    const { showSettings, setShowSettings, useCmdEnterToSend } =
      useSettingsStore();
    const { isModelAvailable } = useAIProviderStore();

    const chat = useLiveQuery(async () => {
      return getChat(chatId);
    }, [chatId]);

    const modelIsAvailable = chat?.model && isModelAvailable(chat.model);

    useWindowFocus(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (
          e.key === "/" &&
          !isFocused &&
          document.activeElement !== textareaRef.current &&
          !isAnyDialogOpenInDOM()
        ) {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isFocused]);

    useEffect(() => {
      if (document.activeElement === textareaRef.current) {
        setIsFocused(true);
      }
    }, []);

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
      if (e.key === "Enter") {
        if (useCmdEnterToSend && !e.metaKey && !e.ctrlKey) {
          return;
        }
        if (!useCmdEnterToSend && (e.metaKey || e.ctrlKey || e.shiftKey)) {
          return;
        }
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

    const isInputDisabled = Boolean(disabled || !modelIsAvailable);

    return (
      <div
        className={cn(
          "flex flex-col rounded-md border border-input bg-background",
          isFocused && "ring-2 ring-ring",
        )}
      >
        <form onSubmit={onSubmit} className="flex flex-row items-start">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
            className="flex-1 mr-2 min-h-[40px] max-h-[200px] resize-none overflow-y-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={
              !modelIsAvailable
                ? "Selected model is not available, configure it in settings or select a different model"
                : isFocused
                  ? "Type your message..."
                  : "Press / to focus chat input and start typing..."
            }
            disabled={isInputDisabled}
            rows={3}
          />
          <div className="flex flex-col space-y-2 m-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={isInputDisabled}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{useCmdEnterToSend ? "⌘+Enter to send" : "Enter to send"}</p>
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
                <p>
                  {showSettings ? "Hide chat settings" : "Show chat settings"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
        {(showSettings || !modelIsAvailable) && (
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
