"use client";

import { NotePad } from "@/app/_components/NotePad";
import { PomodoroTimer } from "@/app/_components/PomodoroTimer";
import { TaskList } from "@/app/_components/TaskList";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function FocusClient() {
  return (
    <ScrollArea className="flex-1 h-full p-4">
      <div className="flex flex-col max-w-2xl w-full mx-auto">
        <PomodoroTimer />
        <hr />
        <TaskList />
        <NotePad />
      </div>
    </ScrollArea>
  );
}
