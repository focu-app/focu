import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { getChat, updateChat } from "@/database/chats";
import { RefreshCw, Trash2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const handleGenerate = async () => {
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
  };

  const handleClear = async () => {
    try {
      await updateChat(chatId, { summary: "", summaryCreatedAt: 0 });
      toast({
        title: "Success",
        description: "Summary cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear summary",
        variant: "destructive",
      });
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
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
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
            <>
              <p className="text-sm text-muted-foreground">
                No summary available.
              </p>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Generate
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
