"use client";
import { getChatsForDay } from "@/database/chats";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/components/ui/command";
import { addDays, subDays } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { usePomodoroStore } from "../store/pomodoroStore"; // Import Pomodoro store
import { useCheckInStore } from "../store/checkinStore";
export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { selectedDate, setSelectedDate, setNewChatDialogOpen } =
    useChatStore();
  const { setIsSettingsOpen } = useOllamaStore();
  const { setIsCheckInOpen } = useCheckInStore();
  const { startTimer, pauseTimer, resetTimer, isActive, mode } =
    usePomodoroStore(); // Destructure Pomodoro store methods
  const router = useRouter();

  const chats = useLiveQuery(async () => {
    if (!selectedDate) {
      return [];
    }
    return getChatsForDay(new Date(`${selectedDate}T00:00:00`));
  }, [selectedDate]);

  const handleSelectChat = (chatId: number) => {
    router.push(`/chat?id=${chatId}`);
    setOpen(false);
  };

  const goToYesterday = () => {
    const date = new Date(
      `${selectedDate || new Date().toISOString().split("T")[0]}T00:00:00`,
    );
    setSelectedDate(subDays(date, 1));
    setOpen(false);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setOpen(false);
  };

  const goToTomorrow = () => {
    const date = new Date(
      `${selectedDate || new Date().toISOString().split("T")[0]}T00:00:00`,
    );
    setSelectedDate(addDays(date, 1));
    setOpen(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setOpen(false);
  };

  const handleOpenFocus = () => {
    setOpen(false);
    router.push("/focus");
  };

  const handleOpenChat = () => {
    setOpen(false);
    router.push("/chat");
  };

  const handleStartPomodoro = () => {
    startTimer();
    setOpen(false);
  };

  const handlePausePomodoro = () => {
    pauseTimer();
    setOpen(false);
  };

  const handleResetPomodoro = () => {
    resetTimer();
    setOpen(false);
  };

  const handleOpenNewChat = () => {
    setNewChatDialogOpen(true);
    setOpen(false);
  };

  const handleOpenCheckIn = () => {
    setIsCheckInOpen(true);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={handleOpenChat}>Chat</CommandItem>
          <CommandItem onSelect={handleOpenFocus}>Focus</CommandItem>
          <CommandItem onSelect={handleOpenSettings}>Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleOpenNewChat}>New Chat</CommandItem>
          <CommandItem onSelect={handleOpenCheckIn}>Check In</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        {chats && (
          <CommandGroup heading="Today's Chats">
            {chats?.map((chat) => (
              <CommandItem
                key={chat.id}
                onSelect={() => handleSelectChat(chat.id!)}
              >
                <span className="hidden">{chat.id}</span>
                {chat.title?.slice(0, 30)}{" "}
                {chat.title?.length && chat.title?.length > 30 && "..."}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Dates">
          <CommandItem onSelect={goToYesterday}>Go one day back</CommandItem>
          <CommandItem onSelect={goToToday}>Go to today</CommandItem>
          <CommandItem onSelect={goToTomorrow}>Go one day forward</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pomodoro">
          <CommandItem onSelect={handleStartPomodoro}>
            Start Pomodoro
          </CommandItem>
          <CommandItem onSelect={handlePausePomodoro}>
            Pause Pomodoro
          </CommandItem>
          <CommandItem onSelect={handleResetPomodoro}>
            Reset Pomodoro
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
