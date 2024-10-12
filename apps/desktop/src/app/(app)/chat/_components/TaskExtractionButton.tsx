import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { ClipboardList } from "lucide-react";
import { TaskExtractionDialog } from "./TaskExtractionDialog";

export function TaskExtractionButton({ chatId }: { chatId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenDialog} variant="outline" size="sm">
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
