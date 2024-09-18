"use client";

import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { ExpandIcon, Play, Pause, RotateCw, Settings } from "lucide-react";
import { useCallback, useEffect } from "react";
import * as workerTimers from "worker-timers";
import { AppDropdownMenu } from "../_components/AppDropdownMenu";
import { TaskItem } from "../_components/TaskItem";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { usePomodoroStore } from "../store/pomodoroStore";

const PomodoroTimer = () => {
  const {
    mode,
    isActive,
    timeLeft,
    customWorkDuration,
    customBreakDuration,
    startTime,
    showSettings,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomWorkDuration,
    setCustomBreakDuration,
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
        const currentDuration =
          mode === "work" ? customWorkDuration : customBreakDuration;
        const newTimeLeft = Math.max(currentDuration - elapsed, 0);

        setTimeLeft(newTimeLeft);
        updateTrayTitle(formatTime(newTimeLeft));

        if (newTimeLeft === 0) {
          if (mode === "work") {
            setMode("break");
            pauseTimer();
            setStartTime(Date.now());
            setTimeLeft(customBreakDuration);
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
    customBreakDuration,
    setMode,
    setStartTime,
    setTimeLeft,
    resetTimer,
  ]);

  const handleClose = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("tray")?.hide();
  }, []);

  const openMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("main")?.show();
    await invoke("set_dock_icon_visibility", { visible: true });
  }, []);

  const handleSetCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
    if (isActive) {
      // Reset timer with new custom durations
      setStartTime(Date.now());
      setTimeLeft(mode === "work" ? customWorkDuration : customBreakDuration);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 flex flex-col justify-between">
      <div className="flex justify-between mb-4">
        <div className="text-4xl font-mono">{formatTime(timeLeft)}</div>
        <AppDropdownMenu />
      </div>
      <div className="flex justify-between space-x-2 mb-4">
        <div className="flex space-x-2">
          <Button
            onClick={isActive ? pauseTimer : startTimer}
            aria-label={isActive ? "Pause" : "Start"}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button variant="ghost" onClick={resetTimer} aria-label="Reset">
            <RotateCw size={16} />
          </Button>
        </div>
        <Button onClick={openMainWindow} size="icon" variant="ghost">
          <ExpandIcon size={16} />
        </Button>
        <Button onClick={() => setShowSettings(true)} aria-label="Settings">
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
              <label className="block text-sm font-medium">
                Work Duration (minutes)
              </label>
              <Input
                type="number"
                value={customWorkDuration / 60}
                onChange={(e) =>
                  setCustomWorkDuration(Number(e.target.value) * 60)
                }
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Break Duration (minutes)
              </label>
              <Input
                type="number"
                value={customBreakDuration / 60}
                onChange={(e) =>
                  setCustomBreakDuration(Number(e.target.value) * 60)
                }
                min={1}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
              <Button variant="ghost" onClick={() => setShowSettings(false)}>
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
