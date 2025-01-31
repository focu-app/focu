import { useModelAvailability } from "@/app/hooks/useModelAvailability";
import { useOllamaStore } from "@/app/store/ollamaStore";
import { useChatStore } from "@/app/store/chatStore";
import { getChat } from "@/database/chats";
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

interface QuickActionMenuProps {
  chatId: number;
}

export function QuickActionMenu({ chatId }: QuickActionMenuProps) {
  const { replyLoading } = useChatStore();
  const { isOllamaRunning } = useOllamaStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const { isUnavailable: isModelUnavailable, isChecking } =
    useModelAvailability(chat?.model);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(
              replyLoading ||
                !isOllamaRunning ||
                isModelUnavailable ||
                isChecking,
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
