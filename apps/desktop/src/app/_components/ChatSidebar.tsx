import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { MessageSquare, Moon, PlusCircle, Sun, ListTodo } from "lucide-react";
import { useEffect } from "react";
import { type Chat, useChatStore } from "../store/chatStore";
import { useOllamaStore } from "../store";
import { cn } from "@repo/ui/lib/utils";

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
        return chat.messages.length > 0
          ? `${chat.messages[0].content.substring(0, 20)}...`
          : "New Chat";
    }
  };

  const hasEmptyGeneralChat = currentDateChats.some(
    (chat) => chat.type === "general" && chat.messages.length === 0,
  );

  return (
    <aside className="w-72 bg-gray-100 overflow-y-auto flex flex-col gap-8">
      <div className="p-4 space-y-2">
        <Button
          variant={showTasks ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => {
            setShowTasks(true);
            onSelectTasks();
          }}
        >
          <ListTodo className="mr-2 h-4 w-4" />
          Focus
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleNewChat}
          disabled={hasEmptyGeneralChat}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4 border-t overflow-y-auto">
        <div className="space-y-2">
          {currentDateChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:cursor-pointer",
                currentChatId === chat.id && !showTasks
                  ? "text-primary bg-gray-200"
                  : "text-muted-foreground",
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              {getChatIcon(chat.type)}
              {getChatTitle(chat)}
            </div>
          ))}
        </div>
      </ScrollArea>
      <Calendar
        mode="single"
        selected={new Date(selectedDate)}
        onSelect={handleDateSelect}
        className="rounded-md border-t"
      />
    </aside>
  );
}
