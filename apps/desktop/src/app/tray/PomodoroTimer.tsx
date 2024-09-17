"use client";

import { Button } from "@repo/ui/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { ExpandIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as workerTimers from "worker-timers";
import { AppDropdownMenu } from "../_components/AppDropdownMenu";
import { TaskItem } from "../_components/TaskItem";
import { type Task, useTaskStore } from "../store/taskStore";

const POMODORO_DURATION = 1500; // 25 minutes in seconds

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { tasks, toggleTask, removeTask, selectedDate } = useTaskStore();

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
        const newTimeLeft = Math.max(POMODORO_DURATION - elapsed, 0);

        setTimeLeft(newTimeLeft);
        const title = formatTime(newTimeLeft);
        updateTrayTitle(title);

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
  }, [isActive, startTime, updateTrayTitle, formatTime]);

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
    updateTrayTitle("");
  }, [updateTrayTitle]);

  const handleClose = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("tray")?.hide();
  }, []);

  const openMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("main")?.show();
    await invoke("set_dock_icon_visibility", { visible: true });
  }, []);

  const currentTasks = tasks[selectedDate] || [];
  const recentTasks = currentTasks
    .sort((a: Task, b: Task) => Number(b.id) - Number(a.id))
    .slice(0, 3);

  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pomodoro</h2>

        <AppDropdownMenu />
      </div>
      <div className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</div>
      <div className="flex justify-between space-x-2 mb-4">
        <div className="flex space-x-2">
          <Button onClick={handleToggle}>{isActive ? "Pause" : "Start"}</Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
        <Button onClick={openMainWindow} size="icon" variant="ghost">
          <ExpandIcon size={16} />
        </Button>
      </div>
      {/* <div>
        <h3 className="text-lg font-semibold mb-2">Recent Tasks</h3>
        <ul className="space-y-2">
          {recentTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onRemove={removeTask}
            />
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default PomodoroTimer;
