"use client";

import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { getChatsForDay } from "@/database/chats";
import type { Chat } from "@/database/db";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@repo/ui/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@repo/ui/components/ui/alert-dialog";
import { useLiveQuery } from "dexie-react-hooks";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils";

export function ChatSidebar() {
  const {
    selectedDate,
    setSelectedDate,
    setNewChatDialogOpen,
    clearChat,
    deleteChat,
    generateChatTitle,
  } = useChatStore();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();
  const pathname = usePathname();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"clear" | "delete" | null>(
    null,
  );
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const chats = useLiveQuery(async () => {
    if (!selectedDate) {
      return [];
    }
    return getChatsForDay(new Date(selectedDate));
  }, [selectedDate]);

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    if (pathname === "/chat") {
      const newDateChats = await getChatsForDay(newDate);
      const nextChat = newDateChats?.[0];
      if (nextChat) {
        router.push(`/chat?id=${nextChat.id}`);
      } else {
        router.push("/chat");
      }
    }
  };

  const getChatTitle = (chat: Chat) => {
    if (chat.title) {
      return chat.title;
    }
    switch (chat.type) {
      case "morning":
        return "Morning Intention";
      case "evening":
        return "Evening Reflection";
      default:
        return "General chat";
    }
  };

  const handleClearChat = async () => {
    if (activeChatId !== null) {
      await clearChat(activeChatId);
      setDialogOpen(false);
    }
  };

  const handleDeleteChat = async () => {
    if (activeChatId !== null) {
      await deleteChat(activeChatId);
      setDialogOpen(false);
    }
  };

  const openContextMenu = (event: React.MouseEvent, chatId: number) => {
    const contextMenuTrigger = window.document.querySelector(
      `#context-menu-trigger-${chatId}`,
    );
    if (contextMenuTrigger) {
      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: false,
        view: window,
        clientX: event.clientX,
        clientY: event.clientY,
      });
      contextMenuTrigger.dispatchEvent(contextMenuEvent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <Button
          variant="outline"
          className="w-full justify-start mr-2"
          onClick={() => setNewChatDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="space-y-2 p-4">
          {chats?.map((chat) => (
            <ContextMenu key={chat.id} modal={false}>
              <ContextMenuTrigger>
                <Button
                  variant={Number(chatId) === chat.id ? "default" : "ghost"}
                  className="flex  w-full items-center justify-between"
                  onClick={() => router.push(`/chat?id=${chat.id}`)}
                  id={`context-menu-trigger-${chat.id}`}
                >
                  {getChatTitle(chat).slice(0, 25)}...
                  <span
                    className={cn(
                      "p-1 rounded-sm hover:bg-primary hover:text-primary-foreground",
                      Number(chatId) === chat.id &&
                        "hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      openContextMenu(event, chat.id as number);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                </Button>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={async () => {
                    await generateChatTitle(chat.id as number);
                  }}
                >
                  Regenerate Chat Title
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveChatId(chat.id as number);
                    setDialogAction("clear");
                    setDialogOpen(true);
                  }}
                >
                  Clear Chat
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveChatId(chat.id as number);
                    setDialogAction("delete");
                    setDialogOpen(true);
                  }}
                  className="text-destructive hover:text-destructive focus:text-destructive"
                >
                  Delete Chat
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </ScrollArea>
      <Calendar
        mode="single"
        selected={selectedDate ? new Date(selectedDate) : undefined}
        onSelect={handleDateSelect}
        className="border-t"
      />

      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {dialogAction === "clear" ? "Clear Chat" : "Delete Chat"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {dialogAction} this chat? This action
            cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                dialogAction === "clear" ? handleClearChat : handleDeleteChat
              }
            >
              {dialogAction === "clear" ? "Clear" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
