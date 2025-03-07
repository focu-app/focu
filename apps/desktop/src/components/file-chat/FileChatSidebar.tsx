"use client";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { useFileChatStore } from "@/store/fileChatStore";
import { useCheckInStore } from "@/store/checkinStore";
import * as fileChatManager from "@/database/file-chat-manager";
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
import { CalendarDays, Check, List, PlusCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { EditChatTitleDialog } from "./EditChatTitleDialog";
import { setupFileChatWatchers } from "@/lib/fileChatWatcher";
import {
  createNewChatAndNavigate,
  deleteChatAndRefresh,
  clearChatAndRefresh,
} from "@/lib/fileChatHelper";

export function FileChatSidebar() {
  const {
    chats,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    initialize,
    loadChats: refreshChats,
  } = useFileChatStore();

  const { setIsCheckInOpen } = useCheckInStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  // State
  const [initialized, setInitialized] = useState(false);
  const [groupedChats, setGroupedChats] = useState<Record<string, FileChat[]>>(
    {},
  );
  const [datesWithChats, setDatesWithChats] = useState<Date[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"clear" | "delete" | null>(
    null,
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Manual initialization
  useEffect(() => {
    const doInitialize = async () => {
      await initialize();
      setInitialized(true);
      // Load chats immediately after initialization
      await refreshChats();

      // Set up file system watchers
      const cleanup = await setupFileChatWatchers();

      // Return cleanup function for when component unmounts
      return cleanup;
    };

    // Initialize and get cleanup function
    const cleanupPromise = doInitialize();

    // Return cleanup function
    return () => {
      // Execute the cleanup when component unmounts
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, [initialize, refreshChats]);

  // Load the chats
  const loadChatsByView = useCallback(async () => {
    // Ensure we only load chats after initialization
    if (!initialized) return;

    try {
      console.log(`Loading chats for view mode: ${viewMode}`);

      if (viewMode === "all") {
        // Load ALL chats
        console.log("Loading ALL chats");
        const allChats = await fileChatManager.getChatsForDay("");

        // Group by date
        const grouped: Record<string, FileChat[]> = {};
        for (const chat of allChats) {
          if (!grouped[chat.dateString]) {
            grouped[chat.dateString] = [];
          }
          grouped[chat.dateString].push(chat);
        }

        // Sort dates in descending order and ensure chats are sorted by creation time
        const sortedGroups: Record<string, FileChat[]> = {};
        const sortedDates = Object.keys(grouped).sort((a, b) =>
          b.localeCompare(a),
        );
        for (const date of sortedDates) {
          sortedGroups[date] = grouped[date].sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
          );
        }

        setGroupedChats(sortedGroups);
      } else {
        // Load chats for specific date
        console.log(`Loading chats for date: ${selectedDate}`);
        const dateChats = await fileChatManager.getChatsForDay(selectedDate);
        const sorted = dateChats.sort((a, b) => {
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setGroupedChats({
          [selectedDate]: sorted,
        });
      }

      // Load dates for calendar
      const allChats = await fileChatManager.getChatsForDay("");
      const uniqueDates = new Set(allChats.map((chat) => chat.dateString));
      setDatesWithChats(
        Array.from(uniqueDates).map((date) => new Date(`${date}T00:00:00`)),
      );
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  }, [initialized, viewMode, selectedDate]);

  // Manually call loadChats whenever dependencies change
  useEffect(() => {
    loadChatsByView();
  }, [loadChatsByView]);

  // Set up a single effect to monitor file changes by polling
  useEffect(() => {
    // Only run if initialized
    if (!initialized) return;

    // Set up an interval to refresh periodically (as a backup in case watch events fail)
    // Use a longer interval (15 seconds) as this is just a fallback
    const intervalId = setInterval(() => {
      try {
        refreshChats();
      } catch (err) {
        console.error("Error in sidebar refresh interval:", err);
      }
    }, 15000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [initialized, refreshChats]);

  // Monitor chats array for changes and update the UI
  useEffect(() => {
    console.log(
      "Chats array or lastUpdate changed, updating sidebar UI",
      chats.length,
    );

    // If we have any chats, update our local state
    if (chats.length > 0 || initialized) {
      const updateGroupedChats = async () => {
        try {
          if (viewMode === "all") {
            // Group by date
            const grouped: Record<string, FileChat[]> = {};
            for (const chat of chats) {
              if (!grouped[chat.dateString]) {
                grouped[chat.dateString] = [];
              }
              grouped[chat.dateString].push(chat);
            }

            // Sort dates in descending order
            const sortedGroups: Record<string, FileChat[]> = {};
            const sortedDates = Object.keys(grouped).sort((a, b) =>
              b.localeCompare(a),
            );
            for (const date of sortedDates) {
              sortedGroups[date] = grouped[date].sort(
                (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
              );
            }

            setGroupedChats(sortedGroups);
          } else {
            // Just set the chats for the selected date
            const dateChats = chats.filter(
              (chat) => chat.dateString === selectedDate,
            );
            const sorted = dateChats.sort(
              (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
            );

            setGroupedChats({
              [selectedDate]: sorted,
            });
          }
        } catch (err) {
          console.error("Error updating grouped chats:", err);
        }
      };

      updateGroupedChats();
    }
  }, [chats, viewMode, selectedDate, initialized]);

  // Centralized function for creating a new chat from anywhere
  const handleNewChat = async () => {
    await createNewChatAndNavigate(router);
  };

  const handleClearChat = async () => {
    if (activeChatId) {
      await clearChatAndRefresh(activeChatId);
      setDialogOpen(false);
      setActiveChatId(null);
      refreshChats();
    }
  };

  const handleDeleteChat = async () => {
    if (activeChatId) {
      const isCurrentChat = chatId === activeChatId;
      await deleteChatAndRefresh(activeChatId, router, isCurrentChat);
      setDialogOpen(false);
      setActiveChatId(null);
      refreshChats();
    }
  };

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (!newDate) return;
    setSelectedDate(format(newDate, "yyyy-MM-dd"));
  };

  const handleEditTitle = (chat: FileChat) => {
    setActiveChatId(chat.id);
    const event = new CustomEvent("file-chat:open-edit-title", {
      detail: { chatId: chat.id },
    });
    window.dispatchEvent(event);
  };

  const handleChangeViewMode = () => {
    const newMode = viewMode === "calendar" ? "all" : "calendar";
    setViewMode(newMode);
  };

  // Helpers
  const getChatTitle = (chat: FileChat) => {
    if (chat.title) return chat.title;
    switch (chat.type) {
      case "morning":
        return "Morning Intention";
      case "evening":
        return "Evening Reflection";
      default:
        return "General chat";
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
          data-allow-context-menu="true"
        >
          {getChatTitle(chat).slice(0, 25)}...
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => handleEditTitle(chat)}>
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
            <Button variant="ghost" size="icon" onClick={handleChangeViewMode}>
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

      <ScrollArea className="flex-grow">
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

      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            // Refresh the sidebar when the dialog closes
            loadChatsByView();
            // Reset the action and activeChatId when dialog closes
            setDialogAction(null);
            setActiveChatId(null);
          }
        }}
      >
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
