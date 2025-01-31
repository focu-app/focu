import { useChatStore } from "@/app/store/chatStore";
import { useOllamaStore } from "@/app/store/ollamaStore";
import { cn } from "@repo/ui/lib/utils";
import { RefreshCw } from "lucide-react";
import type React from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface RegenerateReplyButtonProps {
  chatId: number;
  className?: string;
}

export const RegenerateReplyButton: React.FC<RegenerateReplyButtonProps> = ({
  chatId,
  className,
}) => {
  const { regenerateReply, replyLoading } = useChatStore();
  const { isOllamaRunning } = useOllamaStore();

  const handleRegenerate = async () => {
    await regenerateReply(chatId);
  };

  // Register the regenerate shortcut
  useHotkeys(
    "mod+shift+r",
    (e) => {
      e.preventDefault();
      if (!replyLoading && isOllamaRunning) {
        handleRegenerate();
      }
    },
    {
      enableOnFormTags: true,
      enabled: !replyLoading && isOllamaRunning,
    },
    [handleRegenerate, replyLoading, isOllamaRunning],
  );

  return (
    <button
      type="button"
      onClick={handleRegenerate}
      disabled={replyLoading || !isOllamaRunning}
      className={cn(
        "p-2 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50",
        className,
      )}
      aria-label="Regenerate reply (CMD+Shift+R)"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );
};
