"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (!isActive && intervalId) {
      clearInterval(intervalId);
    }

    if (timeLeft === 0) {
      setIsActive(false);
      // Optionally, emit an event or show a notification
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Pomodoro Timer</h2>
      <div className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</div>
      <div className="flex space-x-2">
        <Button onClick={() => setIsActive(!isActive)}>
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button variant="ghost" onClick={() => setTimeLeft(1500)}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
