"use client";

import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { MessageCircle, Moon, Sun } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import type { ChatType } from "@/database/db";

export function NewChatDialog({
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addChat, selectedDate, sendChatMessage, setNewChatDialogOpen } =
    useChatStore();
  const { activeModel } = useOllamaStore();
  const router = useRouter();

  const handleCreateChat = async (type: ChatType) => {
    if (!activeModel || !selectedDate) {
      return;
    }
    const newChatId = await addChat({
      model: activeModel,
      dateString: new Date(selectedDate).toISOString().split("T")[0],
      type,
    });

    router.push(`/chat?id=${newChatId}`);
    setNewChatDialogOpen(false);

    if (type === "general") return;
    await sendChatMessage(newChatId, "Please start the session.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create a New Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleCreateChat("general")}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            General Chat
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleCreateChat("morning")}
          >
            <Sun className="h-4 w-4 mr-2" />
            Morning Intention
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleCreateChat("evening")}
          >
            <Moon className="h-4 w-4 mr-2" />
            Evening Reflection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
