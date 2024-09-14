"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { WebviewWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const updateTrayTitle = useCallback(
    async (time: number) => {
      const title = formatTime(time);
      await invoke("set_tray_title", { title });
    },
    [formatTime],
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const tick = () => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        updateTrayTitle(newTime);
        return newTime;
      });
    };

    if (isActive) {
      tick(); // Immediate tick when starting or resuming
      intervalId = setInterval(tick, 1000);
    } else {
      updateTrayTitle(timeLeft);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, updateTrayTitle]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsActive(false);
    }
  }, [timeLeft]);

  const handleToggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(1500);
    updateTrayTitle(1500);
  }, [updateTrayTitle]);

  const handleClose = useCallback(async () => {
    const trayWindow = WebviewWindow.getByLabel("tray");
    await trayWindow?.hide();
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
    </div>
  );
};

export default PomodoroTimer;
