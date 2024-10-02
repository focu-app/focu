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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="flex-grow flex flex-col min-h-[250px] gap-4">
        <div className="flex-grow flex flex-col bg-gray-100 dark:bg-gray-700 rounded-md p-2">
          <PomodoroCore compact />

          <p className="flex items-center justify-center text-sm font-bold  mt-8">
            {tasks.filter((task) => !task.completed).length > 0
              ? tasks.filter((task) => !task.completed)[0].text
              : "No tasks"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerSmall;
