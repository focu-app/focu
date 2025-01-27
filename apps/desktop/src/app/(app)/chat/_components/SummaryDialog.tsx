import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { getChat } from "@/database/chats";
import { RefreshCw } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
}

export function SummaryDialog({ isOpen, onClose, chatId }: SummaryDialogProps) {
  const { summarizeChat } = useChatStore();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      await summarizeChat(chatId);
      toast({
        title: "Success",
        description: "Summary regenerated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate summary",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Chat Summary</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
              />
              Regenerate
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {chat?.summary && chat.summary.length > 0 ? (
            <p className="text-sm text-muted-foreground">{chat.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No summary available. Generate a summary first using the Actions
              menu.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
