"use client";

import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { ExpandIcon, Play, Pause, RotateCw, SkipForward } from "lucide-react";
import { useCallback, useEffect } from "react";
import * as workerTimers from "worker-timers";
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
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    startTime,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimeLeft,
    setStartTime,
    formatTime,
  } = usePomodoroStore();

  const { showMainWindow } = useOllamaStore();

  const { tasks } = useTaskStore();

  const { selectedDate } = useChatStore();

  useEffect(() => {
    let intervalId: number | null = null;

    if (isActive) {
      const tick = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTime || now)) / 1000);
        const newTimeLeft = Math.max(timeLeft - 1, 0);

        setTimeLeft(newTimeLeft);

        if (newTimeLeft === 0) {
          if (mode === "work") {
            handleModeChange("shortBreak");
          } else {
            handleModeChange("work");
          }
        }
      };

      intervalId = workerTimers.setInterval(tick, 1000);
    }

    return () => {
      if (intervalId !== null) workerTimers.clearInterval(intervalId);
    };
  }, [isActive, startTime, timeLeft, mode, setTimeLeft]);

  const handleModeChange = useCallback(
    (newMode: "work" | "shortBreak" | "longBreak") => {
      setMode(newMode);
      pauseTimer();
      let duration: number;
      if (newMode === "work") {
        duration = customWorkDuration;
      } else if (newMode === "shortBreak") {
        duration = customShortBreakDuration;
      } else {
        duration = customLongBreakDuration;
      }
      setTimeLeft(duration);
      setStartTime(null);
    },
    [
      setMode,
      pauseTimer,
      customWorkDuration,
      customShortBreakDuration,
      customLongBreakDuration,
      setTimeLeft,
      setStartTime,
    ],
  );

  const handleSkipForward = useCallback(() => {
    const modes = ["work", "shortBreak", "longBreak"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    handleModeChange(modes[nextIndex] as "work" | "shortBreak" | "longBreak");
  }, [mode, handleModeChange]);

  return (
    <div className="p-2 bg-white dark:bg-gray-800 flex flex-col gap-2 w-64 mx-auto w-full">
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
        <Button
          size="sm"
          variant="outline"
          onClick={isActive ? pauseTimer : startTimer}
          aria-label={isActive ? "Pause" : "Start"}
          className="w-24"
        >
          {isActive ? "Pause" : "Start"}
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold p-2">
          {tasks[selectedDate]?.[0]?.text}
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
          onClick={handleSkipForward}
          aria-label="Skip Forward"
          className="h-8 w-8"
        >
          <SkipForward size={14} />
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
