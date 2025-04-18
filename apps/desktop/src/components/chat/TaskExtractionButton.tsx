import { useChatStore } from "@/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { TaskExtractionDialog } from "./TaskExtractionDialog";

export function TaskExtractionButton({ chatId }: { chatId: number }) {
  const { replyLoading } = useChatStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        variant="outline"
        size="sm"
        disabled={replyLoading}
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        Extract Tasks
      </Button>
      <TaskExtractionDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        chatId={chatId}
      />
    </>
  );
}
