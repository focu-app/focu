"use client";

import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { ExpandIcon, Play, Pause, RotateCw, SkipForward } from "lucide-react";
import { usePomodoroStore } from "../store/pomodoroStore";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useOllamaStore } from "../store";
import { useTaskStore } from "../store/taskStore";
import { useChatStore } from "../store/chatStore";

const PomodoroTimerSmall = () => {
  const {
    mode,
    isActive,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    handleModeChange,
    handleSkipForward,
  } = usePomodoroStore();

  const { showMainWindow } = useOllamaStore();

  const { tasks } = useTaskStore();

  const { selectedDate } = useChatStore();

  const mainTask = tasks[selectedDate]?.[0]?.text;

  return (
    <div className="p-2 bg-white dark:bg-gray-800 flex flex-col gap-2 mx-auto w-full h-full">
      <Tabs
        value={mode}
        onValueChange={handleModeChange as (value: string) => void}
      >
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="work" className="text-xs">
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="shortBreak" className="text-xs">
            Short Break
          </TabsTrigger>
          <TabsTrigger value="longBreak" className="text-xs">
            Long Break
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center gap-2 border bg-gray-100 dark:bg-gray-700 rounded-md p-2">
        <div className="text-3xl font-mono">{formatTime(timeLeft)}</div>
        <div className="flex flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={isActive ? pauseTimer : startTimer}
            aria-label={isActive ? "Pause" : "Start"}
            className="w-24"
          >
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSkipForward}
            aria-label="Skip Forward"
            className="h-8 w-8"
          >
            <SkipForward size={14} />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold p-2">
          {mainTask ? mainTask : "No tasks"}
        </p>
      </div>

      <div className="flex justify-between mt-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={resetTimer}
          aria-label="Reset"
          className="h-8 w-8"
        >
          <RotateCw size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={showMainWindow}
          aria-label="Expand"
          className="h-8 w-8"
        >
          <ExpandIcon size={14} />
        </Button>
      </div>
    </div>
  );
};

export default PomodoroTimerSmall;
