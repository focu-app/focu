"use client";

import { Button } from "@repo/ui/components/ui/button";
import { ExpandIcon } from "lucide-react";
import { useOllamaStore } from "../store";
import { useTaskStore } from "../store/taskStore";
import { useChatStore } from "../store/chatStore";
import PomodoroCore from "../_components/PomodoroCore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";
import { getTasksForDay } from "@/database/tasks";

const PomodoroTimerSmall = () => {
  const { showMainWindow } = useOllamaStore();
  const { selectedDate } = useChatStore();

  const tasks =
    useLiveQuery(() => {
      return getTasksForDay(new Date(selectedDate));
    }, [selectedDate]) || [];

  console.log(tasks);

  return (
    <div className="p-2 bg-white dark:bg-gray-800 flex flex-col gap-2 mx-auto w-full h-full">
      <div className="flex flex-row justify-end w-full">
        <Button
          size="icon"
          variant="ghost"
          onClick={showMainWindow}
          aria-label="Expand"
          className="h-8 w-8 flex-shrink-0"
        >
          <ExpandIcon size={14} />
        </Button>
      </div>
      <div className="flex flex-col items-center gap-4 border bg-gray-100 dark:bg-gray-700 rounded-md p-2 h-full">
        <PomodoroCore compact />

        <p className="text-sm font-bold truncate flex-1 mr-2">
          {tasks.length > 0 ? tasks[0].text : "No tasks"}
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimerSmall;
