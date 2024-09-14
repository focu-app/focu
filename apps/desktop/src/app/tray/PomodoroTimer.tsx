"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import * as workerTimers from "worker-timers";

const POMODORO_DURATION = 1500; // 25 minutes in seconds

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const updateTrayTitle = useCallback(
    async (time: number) => {
      await invoke("set_tray_title", { title: formatTime(time) });
    },
    [formatTime],
  );

  useEffect(() => {
    let intervalId: number | null = null;

    if (isActive) {
      const tick = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTime || now)) / 1000);
        const newTimeLeft = Math.max(POMODORO_DURATION - elapsed, 0);

        setTimeLeft(newTimeLeft);
        updateTrayTitle(newTimeLeft);

        if (newTimeLeft === 0) {
          setIsActive(false);
          setStartTime(null);
        }
      };

      tick(); // Immediate tick when starting
      intervalId = workerTimers.setInterval(tick, 1000);
    }

    return () => {
      if (intervalId !== null) workerTimers.clearInterval(intervalId);
    };
  }, [isActive, startTime, updateTrayTitle]);

  const handleToggle = useCallback(() => {
    setIsActive((prev) => {
      if (!prev) {
        setStartTime(Date.now() - (POMODORO_DURATION - timeLeft) * 1000);
      }
      return !prev;
    });
  }, [timeLeft]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(POMODORO_DURATION);
    setStartTime(null);
    updateTrayTitle(POMODORO_DURATION);
  }, [updateTrayTitle]);

  const handleClose = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("tray")?.hide();
  }, []);

  const openMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("main")?.show();
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pomodoro</h2>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Close
        </Button>
      </div>
      <div className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</div>
      <div className="flex space-x-2">
        <Button onClick={handleToggle}>{isActive ? "Pause" : "Start"}</Button>
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <Button onClick={openMainWindow}>Open Main Window</Button>
    </div>
  );
};

export default PomodoroTimer;
