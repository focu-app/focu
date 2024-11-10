"use client";

import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import { NotePad } from "@/app/_components/NotePad";
import { PomodoroTimer } from "@/app/_components/PomodoroTimer";
import { TaskList } from "@/app/_components/TaskList";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function FocusClient() {
  return (
    <div className="flex flex-col h-full bg-background/20">
      <DateNavigationHeader />
      <ScrollArea className="flex flex-col h-full bg-background/40 dark:bg-background/70">
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
