"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";
import { addDays, subDays } from "date-fns";
import { useChatStore } from "../store/chatStore";
import { useOllamaStore } from "../store";
import { MessageSquare, Sun, Moon } from "lucide-react"; // Import icons

export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { selectedDate, setSelectedDate, chats, setCurrentChat, setShowTasks } =
    useChatStore();
  const { setIsSettingsOpen } = useOllamaStore();

  const goToYesterday = () => {
    setSelectedDate(subDays(new Date(selectedDate), 1));
    setOpen(false);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setOpen(false);
  };

  const goToTomorrow = () => {
    setSelectedDate(addDays(new Date(selectedDate), 1));
    setOpen(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setOpen(false);
  };

  const handleOpenFocus = () => {
    setShowTasks(true);
    setOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    setShowTasks(false);
    setOpen(false);
  };

  const todayChats = chats[selectedDate] || [];

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

  const getChatTitle = (chat: (typeof todayChats)[0]) => {
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Today's Chats">
          {todayChats.map((chat) => (
            <CommandItem
              key={chat.id}
              onSelect={() => handleSelectChat(chat.id)}
            >
              {getChatIcon(chat.type)}
              {getChatTitle(chat)}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={goToYesterday}>Go one day back</CommandItem>
          <CommandItem onSelect={goToToday}>Go to today</CommandItem>
          <CommandItem onSelect={goToTomorrow}>Go one day forward</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleOpenFocus}>Open Focus</CommandItem>
          <CommandItem onSelect={handleOpenFocus}>Open Tasks</CommandItem>
          <CommandItem onSelect={handleOpenSettings}>Open Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
