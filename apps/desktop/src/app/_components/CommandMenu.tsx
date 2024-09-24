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

export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { selectedDate, setSelectedDate } = useChatStore();
  const { setIsSettingsOpen } = useOllamaStore();
  const { setShowTasks } = useChatStore(); // Add this line

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={goToYesterday}>Go one day back</CommandItem>
          <CommandItem onSelect={goToToday}>Go to today</CommandItem>
          <CommandItem onSelect={goToTomorrow}>Go one day forward</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleOpenFocus}>Open Focus</CommandItem>
          <CommandItem onSelect={handleOpenSettings}>Open Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
