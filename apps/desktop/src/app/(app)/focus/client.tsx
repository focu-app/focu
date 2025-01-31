"use client";

import { DateNavigationHeader } from "@/components/DateNavigationHeader";
import { NotePad } from "@/components/notes/NotePad";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { TaskList } from "@/components/tasks/TaskList";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function FocusClient() {
  return (
    <div className="flex flex-col h-full">
      <DateNavigationHeader />
      <ScrollArea className="flex flex-col h-full bg-background/80 dark:bg-background/50">
        <div className="flex h-full w-full">
          <div className="flex flex-col max-w-2xl w-full mx-auto p-4 gap-4">
            <PomodoroTimer />
            <Card>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>
            {/* <Card>
          <CardContent> */}
            <NotePad />
            {/* </CardContent>
        </Card> */}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
