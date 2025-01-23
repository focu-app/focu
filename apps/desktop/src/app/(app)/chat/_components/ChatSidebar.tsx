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
import {
  PlusCircle,
  MoreHorizontal,
  Check,
  CalendarDays,
  List,
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@repo/ui/lib/utils";
import { useCheckInStore } from "@/app/store/checkinStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { db } from "@/database/db";
import { format } from "date-fns";
import { EditChatTitleDialog } from "./EditChatTitleDialog";

export function ChatSidebar() {
  const {
    selectedDate,
    setSelectedDate,
    setNewChatDialogOpen,
    clearChat,
    deleteChat,
    generateChatTitle,
    viewMode,
    setViewMode,
    setEditTitleDialogOpen,
    setActiveChatId,
    activeChatId,
  } = useChatStore();
  const { setIsCheckInOpen } = useCheckInStore();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();
  const pathname = usePathname();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"clear" | "delete" | null>(
    null,
  );

  const chats = useLiveQuery(async () => {
    if (viewMode === "calendar" && selectedDate) {
      const dateChats = await getChatsForDay(selectedDate);
      return {
        [selectedDate]: dateChats.sort((a, b) => Number(b.id) - Number(a.id)),
      } as Record<string, Chat[]>;
    }

    if (viewMode === "all") {
      const allChats = await db.chats.toArray();
      // Sort chats by dateString (newest first) and then group them
      const sortedChats = allChats.sort(
        (a, b) =>
          new Date(`${b.dateString}T00:00:00`).getTime() -
          new Date(`${a.dateString}T00:00:00`).getTime(),
      );

      const groupedChats = sortedChats.reduce(
        (acc, chat) => {
          const dateString = chat.dateString;
          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(chat);
          return acc;
        },
        {} as Record<string, Chat[]>,
      );

      // Sort chats within each date group by newest first
      for (const date of Object.keys(groupedChats)) {
        groupedChats[date].sort((a, b) => Number(b.id) - Number(a.id));
      }

      return groupedChats;
    }

    return {};
  }, [viewMode, selectedDate]);

  const datesWithChats = useLiveQuery(async () => {
    const allChats = await db.chats.toArray();
    const uniqueDates = new Set(allChats.map((chat) => chat.dateString));
    return Array.from(uniqueDates).map(
      (dateStr) => new Date(`${dateStr}T00:00:00`),
    );
  });

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (!newDate) return;

    const dateString = format(newDate, "yyyy-MM-dd");
    setSelectedDate(dateString);

    if (viewMode === "all") {
      const element = document.getElementById(`date-group-${dateString}`);
      if (element) {
        element.scrollIntoView({ behavior: "instant" });
      }
    }

    if (pathname === "/chat") {
      const newDateChats = await getChatsForDay(dateString);
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

  const formatDate = (dateString: string) => {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const changeViewMode = (mode: "calendar" | "all") => {
    setViewMode(mode);
    if (mode === "calendar") {
      const dateString = format(new Date(), "yyyy-MM-dd");
      setSelectedDate(dateString);
    }
  };

  const renderChatButton = (chat: Chat) => (
    <ContextMenu key={chat.id} modal={false}>
      <ContextMenuTrigger>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-between",
            Number(chatId) === chat.id && "bg-primary/10 hover:bg-primary/10",
          )}
          onClick={() => {
            setSelectedDate(chat.dateString);
            router.push(`/chat?id=${chat.id}`);
          }}
          id={`context-menu-trigger-${chat.id}`}
          data-allow-context-menu="true"
        >
          {getChatTitle(chat).slice(0, 25)}...
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            setActiveChatId(chat.id as number);
            setEditTitleDialogOpen(true);
          }}
        >
          Edit Chat Title
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
  );

  return (
    <div className="flex flex-col h-full z-50">
      <div className="p-2 flex flex-row gap-2 justify-start items-center h-12 border-b z-10 w-full">
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
          <TooltipContent>New Chat</TooltipContent>
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
          <TooltipContent>Check In</TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                changeViewMode(viewMode === "calendar" ? "all" : "calendar")
              }
            >
              {viewMode === "calendar" ? (
                <List className="h-4 w-4" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Switch to {viewMode === "calendar" ? "All Chats" : "Calendar"} View
          </TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="flex flex-col p-4 gap-2">
          {Object.entries(chats || {}).map(([date, dateChats]) => (
            <div key={date} id={`date-group-${date}`} className="mb-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {formatDate(date)}
              </div>
              <div className="flex flex-col gap-1">
                {dateChats.map(renderChatButton)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="">
        <Calendar
          mode="single"
          selected={
            selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined
          }
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
      <EditChatTitleDialog />
    </div>
  );
}
