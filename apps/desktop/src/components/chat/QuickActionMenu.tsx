import { getChat } from "@/database/chats";
import { useChatStore } from "@/store/chatStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronDown, ClipboardList, List } from "lucide-react";
import { useState } from "react";
import { SummaryDialog } from "./SummaryDialog";
import { TaskExtractionDialog } from "./TaskExtractionDialog";
import { useAIProviderStore } from "@/store/aiProviderStore";

interface QuickActionMenuProps {
  chatId: number;
}

export function QuickActionMenu({ chatId }: QuickActionMenuProps) {
  const { replyLoading } = useChatStore();
  const { isOllamaRunning } = useOllamaStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { isModelAvailable } = useAIProviderStore();
  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const modelIsAvailable = chat?.model ? isModelAvailable(chat.model) : true;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(
              replyLoading || !isOllamaRunning || !modelIsAvailable,
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
          <DropdownMenuItem onClick={() => setIsSummaryDialogOpen(true)}>
            <List className="h-4 w-4 mr-2" />
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
