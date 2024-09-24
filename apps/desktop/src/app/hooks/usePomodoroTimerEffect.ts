import { useEffect } from "react";
import { usePomodoroStore } from "../store/pomodoroStore";
import * as workerTimers from "worker-timers";

export const usePomodoroTimerEffect = () => {
  const { isActive, startTime, timeLeft, mode, setTimeLeft, handleModeChange } = usePomodoroStore();

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
  }, [isActive, startTime, timeLeft, mode, setTimeLeft, handleModeChange]);
};