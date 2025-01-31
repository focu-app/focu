"use client";

import { useChatStore } from "@/store/ollamaStore";
import { getChat, updateChat } from "@/database/chats";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";

export function EditChatTitleDialog() {
  const {
    isEditTitleDialogOpen,
    setEditTitleDialogOpen,
    activeChatId,
    generateChatTitle,
  } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadChatTitle = async () => {
      if (activeChatId) {
        const chat = await getChat(activeChatId);
        if (chat) {
          setTitle(chat.title || "");
        }
      }
    };
    loadChatTitle();
  }, [activeChatId]);

  const handleSave = async () => {
    if (activeChatId) {
      const chat = await getChat(activeChatId);
      if (chat) {
        await updateChat(chat.id!, { title });
        toast({
          title: "Chat title updated",
          description: "The chat title has been successfully updated.",
        });
        setEditTitleDialogOpen(false);
      }
    }
  };

  const handleRegenerateTitle = async () => {
    if (activeChatId) {
      setLoading(true);
      await generateChatTitle(activeChatId);
      const chat = await getChat(activeChatId);
      if (chat) {
        setTitle(chat.title || "");
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={isEditTitleDialogOpen} onOpenChange={setEditTitleDialogOpen}>
      <DialogContent aria-description="Edit Chat Title">
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="py-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerateTitle}
              disabled={loading}
            >
              Regenerate Title
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
