"use client";

import { Button } from "@repo/ui/components/ui/button";
import { ExpandIcon, SparklesIcon } from "lucide-react"; // Import the new icon
import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import PomodoroCore from "../_components/PomodoroCore";
import { useLiveQuery } from "dexie-react-hooks";
import { getTasksForDay } from "@/database/tasks";

const PomodoroTimerSmall = () => {
  const { showMainWindow, isCheckInOpen } = useOllamaStore();
  const { selectedDate } = useChatStore(); // Get isCheckInOpen from chatStore

  const tasks =
    useLiveQuery(() => {
      return getTasksForDay(new Date(selectedDate));
    }, [selectedDate]) || [];

  console.log(tasks);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-grow flex flex-col min-h-[250px] gap-4">
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
      {isCheckInOpen && ( // Conditionally render the CheckIn button
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
