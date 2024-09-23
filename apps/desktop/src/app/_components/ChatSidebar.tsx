import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { MessageSquare, Moon, PlusCircle, Sun, ListTodo } from "lucide-react";
import { useEffect } from "react";
import { type Chat, useChatStore } from "../store/chatStore";
import { useOllamaStore } from "../store";

interface ChatSidebarProps {
  onSelectTasks: () => void;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({ onSelectTasks, onSelectChat }: ChatSidebarProps) {
  const {
    chats,
    currentChatId,
    selectedDate,
    addChat,
    showTasks,
    setShowTasks,
    setSelectedDate,
    ensureDailyChats,
  } = useChatStore();
  const { activeModel } = useOllamaStore();

  useEffect(() => {
    ensureDailyChats(new Date(selectedDate));
  }, [selectedDate, ensureDailyChats]);

  const handleNewChat = () => {
    const newChatId = addChat("general");
    onSelectChat(newChatId);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
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
    <aside className="w-72 bg-gray-100 p-4 overflow-y-auto flex flex-col">
      <div className="border-b space-y-2">
        <Button
          variant={showTasks ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setShowTasks(true);
            onSelectTasks();
          }}
        >
          <ListTodo className="mr-2 h-4 w-4" />
          Focus
        </Button>
        <Button className="w-full justify-start" onClick={handleNewChat}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {currentDateChats.map((chat) => (
            <Button
              key={chat.id}
              variant={
                currentChatId === chat.id && !showTasks ? "default" : "ghost"
              }
              className="w-full justify-start"
              onClick={() => onSelectChat(chat.id)}
            >
              {getChatIcon(chat.type)}
              {getChatTitle(chat)}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <Calendar
        mode="single"
        selected={new Date(selectedDate)}
        onSelect={handleDateSelect}
        className="rounded-md border"
      />
    </aside>
  );
}
