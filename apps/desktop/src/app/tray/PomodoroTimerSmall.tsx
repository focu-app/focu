"use client";

import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { ExpandIcon, Play, Pause, RotateCw } from "lucide-react";
import { useCallback, useEffect } from "react";
import * as workerTimers from "worker-timers";
import { usePomodoroStore } from "../store/pomodoroStore";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

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
  } = usePomodoroStore();

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const updateTrayTitle = useCallback(async (title: string) => {
    await invoke("set_tray_title", { title });
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;

    if (isActive) {
      const tick = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTime || now)) / 1000);
        let currentDuration: number;

        if (mode === "work") {
          currentDuration = customWorkDuration;
        } else if (mode === "shortBreak") {
          currentDuration = customShortBreakDuration;
        } else {
          currentDuration = customLongBreakDuration;
        }

        const newTimeLeft = Math.max(currentDuration - elapsed, 0);

        setTimeLeft(newTimeLeft);
        updateTrayTitle(formatTime(newTimeLeft));

        if (newTimeLeft === 0) {
          if (mode === "work") {
            setMode("shortBreak");
            pauseTimer();
            setStartTime(Date.now());
            setTimeLeft(customShortBreakDuration);
          } else {
            resetTimer();
          }
        }
      };

      tick(); // Immediate tick when starting
      intervalId = workerTimers.setInterval(tick, 1000);
    }

    return () => {
      if (intervalId !== null) workerTimers.clearInterval(intervalId);
    };
  }, [
    isActive,
    startTime,
    updateTrayTitle,
    formatTime,
    mode,
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    setMode,
    setStartTime,
    setTimeLeft,
    resetTimer,
    pauseTimer,
  ]);

  const openMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("main")?.show();
    await invoke("set_dock_icon_visibility", { visible: true });
  }, []);

  const handleModeChange = (newMode: "work" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    if (!isActive) {
      let duration: number;
      if (newMode === "work") {
        duration = customWorkDuration;
      } else if (newMode === "shortBreak") {
        duration = customShortBreakDuration;
      } else {
        duration = customLongBreakDuration;
      }
      setTimeLeft(duration);
    }
  };

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
            Short
          </TabsTrigger>
          <TabsTrigger value="longBreak" className="text-xs">
            Long
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center gap-2">
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
          onClick={openMainWindow}
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
