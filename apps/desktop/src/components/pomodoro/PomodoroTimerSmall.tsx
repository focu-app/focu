"use client";

import { getTasksForDay } from "@/database/tasks";
import { Button } from "@repo/ui/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { ExpandIcon, SparklesIcon } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useCheckInStore } from "../../store/checkinStore";
import { useAppStore } from "@/store/appStore";
import PomodoroCore from "./PomodoroCore";

const PomodoroTimerSmall = () => {
  const { showMainWindow } = useAppStore();
  const { isCheckInOpen } = useCheckInStore();
  const { selectedDate } = useChatStore();

  const tasks =
    useLiveQuery(() => {
      if (!selectedDate) return [];
      return getTasksForDay(selectedDate);
    }, [selectedDate]) || [];

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-grow flex flex-col min-h-[250px] gap-4 bg-background/40 dark:bg-background/70">
        <div className="flex-grow flex flex-col rounded-md p-2">
          <PomodoroCore compact />

          <p className="flex items-center justify-center text-center text-sm font-bold mt-8">
            {tasks.filter((task) => !task.completed).length > 0
              ? tasks.filter((task) => !task.completed)[0].text
              : "No tasks"}
          </p>
        </div>
      </div>
      <div className="absolute bottom-2 right-2">
        <Button size="icon" variant="ghost" onClick={() => showMainWindow()}>
          <ExpandIcon size={14} />
        </Button>
      </div>
      {isCheckInOpen && (
        <div className="absolute bottom-2 left-2">
          <Button size="icon" variant="ghost" onClick={() => showMainWindow()}>
            <SparklesIcon size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimerSmall;
