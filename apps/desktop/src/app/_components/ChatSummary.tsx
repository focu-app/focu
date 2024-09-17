"use client";
import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { useChatStore } from "../store/chatStore";
import Markdown from "react-markdown";
import { FileText } from "lucide-react";

export function ChatSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const { chats, currentChatId, selectedDate } = useChatStore();
  const currentChat = chats[selectedDate].find(
    (chat) => chat.id === currentChatId,
  );

  if (!currentChat?.summary) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <FileText className="h-4 w-4 mr-2" />
        View Summary
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat Summary</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Markdown>{currentChat.summary}</Markdown>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
