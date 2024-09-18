"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Play,
  Pause,
  RotateCw,
  Settings,
  ArrowRight,
  SkipForward,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import * as workerTimers from "worker-timers";
import { AppDropdownMenu } from "../_components/AppDropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { usePomodoroStore } from "../store/pomodoroStore";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

const PomodoroTimer = () => {
  const {
    mode,
    isActive,
    timeLeft,
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    startTime,
    showSettings,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomWorkDuration,
    setCustomShortBreakDuration,
    setCustomLongBreakDuration,
    setShowSettings,
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

  const handleSetCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
    if (!isActive) {
      setTimeLeft(
        mode === "work" ? customWorkDuration : customShortBreakDuration,
      );
    }
  };

  const handleModeChange = useCallback(
    (newMode: "work" | "shortBreak" | "longBreak") => {
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
    },
    [
      isActive,
      setMode,
      customWorkDuration,
      customShortBreakDuration,
      customLongBreakDuration,
      setTimeLeft,
    ],
  );

  const handleSkipForward = useCallback(() => {
    const modes = ["work", "shortBreak", "longBreak"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    handleModeChange(modes[nextIndex] as "work" | "shortBreak" | "longBreak");
  }, [mode, handleModeChange]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 flex flex-col gap-4 justify-between">
      <Tabs
        value={mode}
        onValueChange={handleModeChange as (value: string) => void}
      >
        <TabsList className="flex space-x-4 mb-8">
          <TabsTrigger value="work">Pomodoro</TabsTrigger>
          <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
          <TabsTrigger value="longBreak">Long Break</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-6xl font-mono">{formatTime(timeLeft)}</div>
      </div>

      <div className="flex justify-center items-center my-4 gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={isActive ? pauseTimer : startTimer}
          aria-label={isActive ? "Pause" : "Start"}
          className="w-24"
        >
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkipForward}
          aria-label="Skip Forward"
        >
          <SkipForward size={16} />
        </Button>
      </div>

      <div className="flex justify-between mb-4">
        <Button variant="ghost" onClick={resetTimer} aria-label="Reset">
          <RotateCw size={16} />
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <Settings size={16} />
        </Button>
      </div>
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="w-[300px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetCustomDuration} className="py-4 space-y-4">
            <div>
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                value={customWorkDuration / 60}
                onChange={(e) =>
                  setCustomWorkDuration(Number(e.target.value) * 60)
                }
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="short-break-duration">
                Short Break Duration (minutes)
              </Label>
              <Input
                id="short-break-duration"
                type="number"
                value={customShortBreakDuration / 60}
                onChange={(e) =>
                  setCustomShortBreakDuration(Number(e.target.value) * 60)
                }
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="long-break-duration">
                Long Break Duration (minutes)
              </Label>
              <Input
                id="long-break-duration"
                type="number"
                value={customLongBreakDuration / 60}
                onChange={(e) =>
                  setCustomLongBreakDuration(Number(e.target.value) * 60)
                }
                min={1}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettings(false)}
                type="button"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PomodoroTimer;
