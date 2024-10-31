"use client";

import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import { TaskList } from "@/app/_components/TaskList";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function TasksClient() {
  return (
    <ScrollArea className="flex flex-col h-full">
      <DateNavigationHeader />
      <div className="flex flex-col max-w-2xl w-full mx-auto p-4 gap-4">
        <Card>
          <CardContent>
            <TaskList />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
