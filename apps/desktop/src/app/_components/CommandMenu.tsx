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
import { useOllamaStoreShallow } from "../store";

export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { selectedDate, setSelectedDate } = useChatStore();
  const { setIsSettingsOpen } = useOllamaStoreShallow();

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={goToYesterday}>Go to yesterday</CommandItem>
          <CommandItem onSelect={goToToday}>Go to today</CommandItem>
          <CommandItem onSelect={goToTomorrow}>Go to tomorrow</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleOpenSettings}>Open Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
