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
import { PlusCircle, MoreHorizontal, Check } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { useCheckInStore } from "@/app/store/checkinStore";
import { TooltipPortal, TooltipProvider } from "@repo/ui/components/ui/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { db } from "@/database/db";

export function ChatSidebar() {
  const {
    selectedDate,
    setSelectedDate,
    setNewChatDialogOpen,
    clearChat,
    deleteChat,
    generateChatTitle,
  } = useChatStore();
  const { setIsCheckInOpen } = useCheckInStore();
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

  const datesWithChats = useLiveQuery(async () => {
    const allChats = await db.chats.toArray();
    const uniqueDates = new Set(allChats.map((chat) => chat.date));
    return Array.from(uniqueDates).map((dateStr) => new Date(dateStr));
  });

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

  return (
    <div className="flex flex-col h-full z-50">
      <div className="p-2 flex flex-row gap-2 justify-start h-12 border-b z-10 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNewChatDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>New Chat</TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCheckInOpen(true)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Check In</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <ScrollArea className="flex-grow">
        <div className="flex flex-col p-4 gap-2">
          {chats?.map((chat) => (
            <ContextMenu key={chat.id} modal={false}>
              <ContextMenuTrigger>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-between",
                    Number(chatId) === chat.id &&
                      "bg-primary/10 hover:bg-primary/10",
                  )}
                  onClick={() => router.push(`/chat?id=${chat.id}`)}
                  id={`context-menu-trigger-${chat.id}`}
                  data-allow-context-menu="true"
                >
                  {getChatTitle(chat).slice(0, 25)}...
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
                >
                  Delete Chat
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </ScrollArea>
      <div className="">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={handleDateSelect}
          modifiers={{ hasChat: datesWithChats || [] }}
          modifiersClassNames={{
            hasChat:
              "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary/50",
          }}
        />
      </div>

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
