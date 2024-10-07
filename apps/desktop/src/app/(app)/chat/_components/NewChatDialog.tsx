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
import { useRouter } from "next/navigation";

type ChatType = "general" | "morning" | "evening";

export function NewChatDialog() {
  const { addChat, selectedDate, isNewChatDialogOpen, setNewChatDialogOpen } =
    useChatStore();
  const { activeModel } = useOllamaStore();
  const router = useRouter();

  const handleCreateChat = async (type: ChatType) => {
    if (!activeModel || !selectedDate) {
      return;
    }
    const newChatId = await addChat({
      model: activeModel,
      date: new Date(selectedDate).setHours(0, 0, 0, 0),
      messages: [],
      type,
    });

    router.push(`/chat?id=${newChatId}`);
    setNewChatDialogOpen(false);
  };

  return (
    <Dialog open={isNewChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
