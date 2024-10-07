"use client";

import { NotePad } from "@/app/_components/NotePad";
import { PomodoroTimer } from "@/app/_components/PomodoroTimer";
import { TaskList } from "@/app/_components/TaskList";
import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { format } from "date-fns";
import { SettingsIcon } from "lucide-react";

export default function FocusClient() {
  const { selectedDate } = useChatStore();
  const { setIsSettingsOpen } = useOllamaStore();

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">
          {format(new Date(selectedDate || ""), "MMMM d")}{" "}
        </h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1 h-full p-4">
        <div className="flex flex-col max-w-2xl w-full mx-auto">
          <PomodoroTimer />
          <hr />
          <TaskList />
          <NotePad />
        </div>
      </ScrollArea>
    </>
  );
}
