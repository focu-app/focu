"use client";

import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import { TaskList } from "@/app/_components/tasks/TaskList";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function TasksClient() {
  return (
    <div className="flex flex-col h-full bg-background/20">
      <DateNavigationHeader />

      <ScrollArea className="flex flex-col h-full bg-background/40 dark:bg-background/70">
        <div className="flex flex-col max-w-2xl w-full mx-auto p-4 gap-4">
          <Card>
            <CardContent>
              <TaskList />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
