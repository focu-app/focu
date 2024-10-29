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
import { useLiveQuery } from "dexie-react-hooks";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ChatSidebar() {
  const {
    selectedDate,
    setSelectedDate,
    setNewChatDialogOpen,
    clearChat,
    deleteChat,
  } = useChatStore();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();
  const pathname = usePathname();

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

  const handleClearChat = async (chatId: number) => {
    await clearChat(chatId);
  };

  const handleDeleteChat = async (chatId: number) => {
    await deleteChat(chatId);
  };

  const openContextMenu = (event: React.MouseEvent, chatId: number) => {
    const contextMenuTrigger = window.document.querySelector(
      `#context-menu-trigger-${chatId}`,
    );
    console.log(contextMenuTrigger);
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
                <div className="flex  w-full items-center justify-between">
                  <Button
                    variant={Number(chatId) === chat.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push(`/chat?id=${chat.id}`)}
                    id={`context-menu-trigger-${chat.id}`}
                  >
                    {getChatTitle(chat).slice(0, 30)}...
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) =>
                      openContextMenu(event, chat.id as number)
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={() => handleClearChat(chat.id as number)}
                >
                  Clear Chat
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => handleDeleteChat(chat.id as number)}
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
    </div>
  );
}
