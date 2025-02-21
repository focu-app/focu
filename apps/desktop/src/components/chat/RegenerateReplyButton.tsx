import { useChatStore } from "@/store/chatStore";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { cn } from "@repo/ui/lib/utils";
import { RefreshCw } from "lucide-react";
import type React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLiveQuery } from "dexie-react-hooks";
import { getChat } from "@/database/chats";

interface RegenerateReplyButtonProps {
  chatId: number;
  className?: string;
}

export const RegenerateReplyButton: React.FC<RegenerateReplyButtonProps> = ({
  chatId,
  className,
}) => {
  const { regenerateReply, replyLoading } = useChatStore();
  const { isModelAvailable } = useAIProviderStore();

  const handleRegenerate = async () => {
    await regenerateReply(chatId);
  };
  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const modelIsAvailable = chat?.model ? isModelAvailable(chat.model) : true;

  // Register the regenerate shortcut
  useHotkeys(
    "mod+shift+r",
    (e) => {
      e.preventDefault();
      if (!replyLoading && modelIsAvailable) {
        handleRegenerate();
      }
    },
    {
      enableOnFormTags: true,
      enabled: !replyLoading && modelIsAvailable,
    },
    [handleRegenerate, replyLoading, modelIsAvailable],
  );

  return (
    <button
      type="button"
      onClick={handleRegenerate}
      disabled={replyLoading || !modelIsAvailable}
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
