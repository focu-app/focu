import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown, ClipboardList, List, FileText } from "lucide-react";
import { useState } from "react";
import { TaskExtractionDialog } from "./TaskExtractionDialog";
import { SummaryDialog } from "./SummaryDialog";
import { useOllamaStore } from "@/app/store";
import { useLiveQuery } from "dexie-react-hooks";
import { getChat } from "@/database/chats";
import { useToast } from "@repo/ui/hooks/use-toast";

interface QuickActionMenuProps {
  chatId: number;
}

export function QuickActionMenu({ chatId }: QuickActionMenuProps) {
  const { replyLoading, summarizeChat } = useChatStore();
  const { isOllamaRunning, isModelAvailable } = useOllamaStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { toast } = useToast();

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const isModelUnavailable = chat?.model && !isModelAvailable(chat.model);

  const handleSummarize = async () => {
    try {
      await summarizeChat(chatId);
      toast({
        title: "Success",
        description: "Chat summarized successfully",
      });
      setIsSummaryDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to summarize chat",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(
              replyLoading || !isOllamaRunning || isModelUnavailable,
            )}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem onClick={() => setIsTaskDialogOpen(true)}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Extract Tasks
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSummarize}>
            <List className="h-4 w-4 mr-2" />
            Generate Summary
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsSummaryDialogOpen(true)}
            disabled={!chat?.summary || chat.summary.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Summary
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskExtractionDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        chatId={chatId}
      />

      <SummaryDialog
        isOpen={isSummaryDialogOpen}
        onClose={() => setIsSummaryDialogOpen(false)}
        chatId={chatId}
      />
    </>
  );
}
