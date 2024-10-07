"use client";

import { getChatsForDay } from "@/database/chats";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { ListTodo, PlusCircle } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";
import { useOllamaStore } from "@/app/store";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import type { Chat } from "@/database/db";

export function Sidebar() {
  const { addChat, selectedDate, setSelectedDate } = useChatStore();
  const { activeModel } = useOllamaStore();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const router = useRouter();
  const pathname = usePathname();
  const handleAddChat = async () => {
    if (!activeModel || !selectedDate) {
      return;
    }
    const newChatId = await addChat({
      model: activeModel,
      date: new Date(selectedDate).setHours(0, 0, 0, 0),
      messages: [],
      type: "general",
    });

    router.push(`/chat?id=${newChatId}`);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    console.log("newDate", newDate);
    if (newDate) {
      setSelectedDate(newDate);
      router.push("/chat");
    }
  };

  const chats = useLiveQuery(async () => {
    console.log("selectedDate", selectedDate);
    if (!selectedDate) {
      return [];
    }
    return getChatsForDay(new Date(selectedDate));
  }, [selectedDate]);

  const getChatTitle = (chat: Chat) => {
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
    <aside className="w-72 overflow-y-auto flex flex-col gap-8">
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleAddChat}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
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
      </div>
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {chats?.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat?id=${chat.id}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:cursor-pointer",
                Number(chatId) === chat.id
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {getChatTitle(chat)}
            </Link>
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
