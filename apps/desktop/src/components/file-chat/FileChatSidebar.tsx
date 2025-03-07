"use client";
import { useFileChatStore } from "@/store/fileChatStore";
import { useCheckInStore } from "@/store/checkinStore";
import type { FileChat } from "@/database/file-types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Check, List, PlusCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as fileChatManager from "@/database/file-chat-manager";
import { EditChatTitleDialog } from "./EditChatTitleDialog";

export function FileChatSidebar() {
  const {
    initialize,
    loadChats,
    createChat,
    selectChat,
    deleteChat,
    clearMessages,
    chats,
    selectedChat,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    isInitialized,
  } = useFileChatStore();
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
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [groupedChats, setGroupedChats] = useState<Record<string, FileChat[]>>(
    {},
  );
  const [datesWithChats, setDatesWithChats] = useState<Date[]>([]);
  const [isEditTitleDialogOpen, setEditTitleDialogOpen] = useState(false);

  // Initialize the file chat store
  useEffect(() => {
    const initializeFileChatStore = async () => {
      console.log(
        `Starting initialization with selected date: ${selectedDate} and view mode: ${viewMode}`,
      );
      await initialize();

      // Load chats based on the current viewMode
      if (viewMode === "calendar") {
        await loadChats(selectedDate);

        // Fetch chats for the selected date
        const dateChats = await fileChatManager.getChatsForDay(selectedDate);
        console.log(
          `Initial load: Fetched ${dateChats.length} chats for date ${selectedDate}`,
        );

        setGroupedChats({
          [selectedDate]: dateChats.sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
          ),
        });
      } else {
        // For "all" view, fetch all chats
        const allChats = await fileChatManager.getChatsForDay("");
        console.log(
          `Initial load: Fetched ${allChats.length} total chats for all view`,
        );

        // Group chats by date
        const grouped = allChats.reduce(
          (acc, chat) => {
            if (!acc[chat.dateString]) {
              acc[chat.dateString] = [];
            }
            acc[chat.dateString].push(chat);
            return acc;
          },
          {} as Record<string, FileChat[]>,
        );

        // Sort each group
        for (const date of Object.keys(grouped)) {
          grouped[date].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        setGroupedChats(grouped);
      }

      // Check if we need to create a test chat
      const allChats = await fileChatManager.getChatsForDay("");
      if (allChats.length === 0) {
        console.log("Creating test chat as no chats exist");
        await createChat();
      }
    };

    initializeFileChatStore();
  }, [initialize, loadChats, selectedDate, viewMode, createChat]);

  // Load chats when view mode or selected date changes
  useEffect(() => {
    // Skip if not yet initialized
    if (!isInitialized) {
      console.log("Skipping fetchChats since not initialized yet");
      return;
    }

    const fetchChats = async () => {
      if (viewMode === "calendar" && selectedDate) {
        await loadChats(selectedDate);
        const dateChats = await fileChatManager.getChatsForDay(selectedDate);
        console.log(
          `Fetched ${dateChats.length} chats for date ${selectedDate}`,
        );
        setGroupedChats({
          [selectedDate]: dateChats.sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
          ),
        });
      } else if (viewMode === "all") {
        // Fetch all chats
        const allChats = await fileChatManager.getChatsForDay("");
        console.log(`Fetched ${allChats.length} total chats for all view`);

        // Sort chats by dateString (newest first) and then group them
        const sortedChats = allChats.sort(
          (a, b) =>
            new Date(`${b.dateString}T00:00:00`).getTime() -
            new Date(`${a.dateString}T00:00:00`).getTime(),
        );

        const grouped = sortedChats.reduce(
          (acc, chat) => {
            const dateString = chat.dateString;
            if (!acc[dateString]) {
              acc[dateString] = [];
            }
            acc[dateString].push(chat);
            return acc;
          },
          {} as Record<string, FileChat[]>,
        );

        // Sort chats within each date group
        for (const date of Object.keys(grouped)) {
          grouped[date].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        console.log(`Grouped chats into ${Object.keys(grouped).length} dates`);
        setGroupedChats(grouped);
      }
    };

    fetchChats();
  }, [viewMode, selectedDate, loadChats, isInitialized]);

  // Collect dates with chats for calendar display
  useEffect(() => {
    const fetchDatesWithChats = async () => {
      const allChats = await fileChatManager.getChatsForDay("");
      const uniqueDates = new Set(allChats.map((chat) => chat.dateString));
      const dates = Array.from(uniqueDates).map(
        (dateStr) => new Date(`${dateStr}T00:00:00`),
      );
      setDatesWithChats(dates);
    };

    fetchDatesWithChats();
  }, []);

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

    if (pathname === "/file-chat") {
      const newDateChats = await fileChatManager.getChatsForDay(dateString);
      const nextChat = newDateChats?.[0];
      if (nextChat) {
        router.push(`/file-chat?id=${nextChat.id}`);
      } else {
        router.push("/file-chat");
      }
    }
  };

  const getChatTitle = (chat: FileChat) => {
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
      await clearMessages();
      setDialogOpen(false);
      setActiveChatId(null);
    }
  };

  const handleDeleteChat = async () => {
    if (activeChatId !== null) {
      await deleteChat(activeChatId);
      setDialogOpen(false);
      setActiveChatId(null);
      router.push("/file-chat");
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

  const handleNewChat = async () => {
    console.log("Creating new chat from button click");
    const newChat = await createChat();
    console.log("New chat created:", newChat);

    if (newChat) {
      // Force refresh chats based on current view mode
      if (viewMode === "calendar") {
        // If the new chat is for the currently selected date, update the grouped chats
        if (newChat.dateString === selectedDate) {
          const dateChats = await fileChatManager.getChatsForDay(selectedDate);
          console.log(
            `After creating chat, found ${dateChats.length} chats for date ${selectedDate}`,
          );
          setGroupedChats({
            [selectedDate]: dateChats.sort(
              (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
            ),
          });
        } else {
          // If it's for a different date, update the selected date to match the new chat
          setSelectedDate(newChat.dateString);
        }
      } else {
        // For "all" view, fetch all chats and update the groupedChats
        const allChats = await fileChatManager.getChatsForDay("");
        const sortedChats = allChats.sort(
          (a, b) =>
            new Date(`${b.dateString}T00:00:00`).getTime() -
            new Date(`${a.dateString}T00:00:00`).getTime(),
        );

        const grouped = sortedChats.reduce(
          (acc, chat) => {
            const dateString = chat.dateString;
            if (!acc[dateString]) {
              acc[dateString] = [];
            }
            acc[dateString].push(chat);
            return acc;
          },
          {} as Record<string, FileChat[]>,
        );

        // Sort chats within each date group
        for (const date of Object.keys(grouped)) {
          grouped[date].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        setGroupedChats(grouped);
      }

      // Navigate to the new chat
      router.push(`/file-chat?id=${newChat.id}`);
    }
  };

  const handleEditTitle = (chat: FileChat) => {
    setActiveChatId(chat.id);
    // Dispatch custom event for the EditChatTitleDialog to listen for
    const event = new CustomEvent("file-chat:open-edit-title", {
      detail: { chatId: chat.id },
    });
    window.dispatchEvent(event);
  };

  const renderChatButton = (chat: FileChat) => (
    <ContextMenu key={chat.id} modal={false}>
      <ContextMenuTrigger>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-between",
            chatId === chat.id && "bg-primary/10 hover:bg-primary/10",
          )}
          onClick={() => {
            setSelectedDate(chat.dateString);
            router.push(`/file-chat?id=${chat.id}`);
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
            handleEditTitle(chat);
          }}
        >
          Edit Chat Title
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            setActiveChatId(chat.id);
            setDialogAction("clear");
            setDialogOpen(true);
          }}
        >
          Clear Chat
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            setActiveChatId(chat.id);
            setDialogAction("delete");
            setDialogOpen(true);
          }}
        >
          Delete Chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  // Render logging for debugging - only log if something changes
  const prevGroupedChatsCount = useRef(0);
  const prevDatesWithChatsCount = useRef(0);

  useEffect(() => {
    const groupedChatsCount = Object.keys(groupedChats).length;
    const datesWithChatsCount = datesWithChats.length;

    // Only log if something changed
    if (
      groupedChatsCount !== prevGroupedChatsCount.current ||
      datesWithChatsCount !== prevDatesWithChatsCount.current
    ) {
      console.log("FileChatSidebar updated:", {
        viewMode,
        selectedDate,
        groupedChatsCount,
        datesWithChatsCount,
      });

      prevGroupedChatsCount.current = groupedChatsCount;
      prevDatesWithChatsCount.current = datesWithChatsCount;
    }
  });

  return (
    <div className="flex flex-col h-full z-50">
      <div className="p-2 flex flex-row gap-2 justify-start items-center h-12 border-b z-10 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleNewChat}>
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
        <div data-tauri-drag-region className="flex-1 h-full" />

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
          {Object.keys(groupedChats).length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center">
              No chats found. Create a new chat to get started.
            </div>
          ) : (
            Object.entries(groupedChats).map(([date, dateChats]) => (
              <div key={date} id={`date-group-${date}`} className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {formatDate(date)}
                </div>
                <div className="flex flex-col gap-1">
                  {dateChats.map(renderChatButton)}
                </div>
              </div>
            ))
          )}
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
