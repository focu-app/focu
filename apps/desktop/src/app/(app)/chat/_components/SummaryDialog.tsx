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
import { useState, useEffect } from "react";

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
}

export function SummaryDialog({ isOpen, onClose, chatId }: SummaryDialogProps) {
  const { summarizeChat } = useChatStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  useEffect(() => {
    const generateSummary = async () => {
      if (!chat?.summary || chat.summary.length === 0) {
        try {
          setIsLoading(true);
          await summarizeChat(chatId);
          toast({
            title: "Success",
            description: "Summary generated successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate summary",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isOpen) {
      generateSummary();
    }
  }, [isOpen, chat?.summary, chatId, summarizeChat, toast]);

  const handleRegenerate = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chat?.summary && chat.summary.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">{chat.summary}</p>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Regenerate
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No summary available. Generating summary...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
