"use client";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  console.log("CommandMenu");

  useEffect(() => {
    const shortcuts = [{ key: "k", action: () => setOpen((open) => !open) }];

    console.log("useEffect");

    const handleKeyPress = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.key === event.key && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          shortcut.action();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions"></CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
