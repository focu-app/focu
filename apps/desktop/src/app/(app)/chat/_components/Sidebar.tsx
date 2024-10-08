"use client";

import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { getChatsForDay } from "@/database/chats";
import type { Chat } from "@/database/db";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useLiveQuery } from "dexie-react-hooks";
import { ListTodo, PlusCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Sidebar() {
  const { selectedDate, setSelectedDate, setNewChatDialogOpen } =
    useChatStore();
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
    console.log("newDate", newDate);
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

  return (
    <aside className="w-72 overflow-y-auto flex flex-col gap-4">
      <div className="p-4 space-y-2">
        <Button
          variant={pathname === "/focus" ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => {
            router.push("/focus");
          }}
        >
          <ListTodo className="mr-2 h-4 w-4" />
          Focus
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setNewChatDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {chats?.map((chat) => (
            <Button
              key={chat.id}
              variant={Number(chatId) === chat.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push(`/chat?id=${chat.id}`)}
            >
              {getChatTitle(chat).slice(0, 30)}...
            </Button>
          ))}
        </div>
      </ScrollArea>
      <Calendar
        mode="single"
        selected={selectedDate ? new Date(selectedDate) : undefined}
        onSelect={handleDateSelect}
        className="rounded-md"
      />
    </aside>
  );
}
