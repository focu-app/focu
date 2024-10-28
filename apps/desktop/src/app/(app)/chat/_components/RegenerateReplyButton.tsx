import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { RefreshCw } from "lucide-react";
import type React from "react";

interface RegenerateReplyButtonProps {
  chatId: number;
}

export const RegenerateReplyButton: React.FC<RegenerateReplyButtonProps> = ({
  chatId,
}) => {
  const { regenerateReply, replyLoading } = useChatStore();

  const handleRegenerate = async () => {
    await regenerateReply(chatId);
  };

  return (
    <Button
      onClick={handleRegenerate}
      disabled={replyLoading}
      variant="outline"
      size="sm"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Regenerate Reply
    </Button>
  );
};
