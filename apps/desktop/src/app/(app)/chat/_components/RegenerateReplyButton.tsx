import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { cn } from "@repo/ui/lib/utils";
import { RefreshCw } from "lucide-react";
import type React from "react";

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

  return (
    <button
      type="button"
      onClick={handleRegenerate}
      disabled={replyLoading || !isOllamaRunning}
      className={cn(
        "p-2 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50",
        className,
      )}
      aria-label="Regenerate reply"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );
};
