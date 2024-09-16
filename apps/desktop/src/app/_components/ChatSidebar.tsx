import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { PlusCircle, MessageSquare, CheckSquare } from "lucide-react";
import { useChatStore } from "../store/chatStore";

// Add this new prop
interface ChatSidebarProps {
  onSelectTodo: () => void;
  onSelectChat: (chatId: string) => void; // Add this line
}

export function ChatSidebar({ onSelectTodo, onSelectChat }: ChatSidebarProps) {
  const { chats, currentChatId, addChat, setCurrentChat } = useChatStore();

  const handleNewChat = () => {
    addChat();
    onSelectChat(chats[chats.length - 1].id); // Select the newly created chat
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-4 border-b">
        <Button className="w-full mb-2" onClick={handleNewChat}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button className="w-full" onClick={onSelectTodo}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Todo List
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {chats
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((chat) => (
            <div
              key={chat.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                chat.id === currentChatId ? "bg-gray-200" : ""
              }`}
              onClick={() => onSelectChat(chat.id)} // Update this line
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <div className="truncate">
                  {chat.messages.length > 1
                    ? `${chat.messages[1].content.substring(0, 20)}...`
                    : "New Chat"}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(chat.createdAt)}
              </div>
            </div>
          ))}
      </ScrollArea>
    </div>
  );
}
