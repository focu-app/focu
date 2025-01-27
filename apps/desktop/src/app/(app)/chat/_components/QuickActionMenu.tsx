import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown, ClipboardList, List } from "lucide-react";
import { useState } from "react";
import { TaskExtractionDialog } from "./TaskExtractionDialog";
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
            Extract Tasks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSummarize}>
            <List className="h-4 w-4 mr-2" />
            Summarize Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskExtractionDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        chatId={chatId}
      />
    </>
  );
}
