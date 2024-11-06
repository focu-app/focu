import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown, ClipboardList, MoreVertical } from "lucide-react";
import { useState } from "react";
import { TaskExtractionDialog } from "./TaskExtractionDialog";

interface QuickActionMenuProps {
  chatId: number;
}

export function QuickActionMenu({ chatId }: QuickActionMenuProps) {
  const { replyLoading } = useChatStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={replyLoading}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsTaskDialogOpen(true)}>
            Extract Tasks
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
