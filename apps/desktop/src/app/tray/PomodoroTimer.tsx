"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Settings } from "lucide-react";
import { usePomodoroStore } from "../store/pomodoroStore";
import PomodoroCore from "../_components/PomodoroCore";

const PomodoroTimer = () => {
  const { setShowSettings } = usePomodoroStore();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 flex flex-col gap-4 justify-between">
      <div className="flex flex-col flex-end gap-8 border bg-gray-100 dark:bg-gray-700 rounded-md p-4">
        <PomodoroCore />
      </div>
    </div>
  );
};

export default PomodoroTimer;
