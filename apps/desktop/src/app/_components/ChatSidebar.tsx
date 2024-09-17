import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  PlusCircle,
  MessageSquare,
  CheckSquare,
  Sun,
  Moon,
} from "lucide-react";
import { useChatStore, type Chat } from "../store/chatStore";
import { format, parseISO } from "date-fns";

interface ChatSidebarProps {
  onSelectTasks: () => void;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({ onSelectTasks, onSelectChat }: ChatSidebarProps) {
  const {
    chats,
    currentChatId,
    addChat,
    setCurrentChat,
    setSelectedDate,
    selectedDate,
    ensureDailyChats,
  } = useChatStore();
  const [date, setDate] = useState<Date>(parseISO(selectedDate));
  console.log(selectedDate, date);

  useEffect(() => {
    setSelectedDate(date);
    ensureDailyChats(date);
  }, [date, setSelectedDate, ensureDailyChats]);

  const handleNewChat = () => {
    const newChatId = addChat("general");
    onSelectChat(newChatId);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const currentDateChats = chats[selectedDate] || [];

  const getChatIcon = (type: "morning" | "evening" | "general") => {
    switch (type) {
      case "morning":
        return <Sun className="h-4 w-4 mr-2" />;
      case "evening":
        return <Moon className="h-4 w-4 mr-2" />;
      default:
        return <MessageSquare className="h-4 w-4 mr-2" />;
    }
  };

  const getChatTitle = (chat: Chat) => {
    switch (chat.type) {
      case "morning":
        return "Morning Intention";
      case "evening":
        return "Evening Reflection";
      default:
        return chat.messages.length > 1
          ? `${chat.messages[1].content.substring(0, 20)}...`
          : "New Chat";
    }
  };

  return (
    <div className="w-72 border-r flex flex-col">
      <div className="p-4 border-b space-y-2">
        <Button className="w-full" onClick={handleNewChat}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button className="w-full" onClick={onSelectTasks}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Task List
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {currentDateChats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 cursor-pointer hover:bg-gray-100 ${
              chat.id === currentChatId ? "bg-gray-200" : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center">
              {getChatIcon(chat.type)}
              <div className="truncate">{getChatTitle(chat)}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatTime(chat.id)}
            </div>
          </div>
        ))}
      </ScrollArea>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md border"
      />
    </div>
  );
}
