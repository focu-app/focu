"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Play, Pause, RotateCw, SkipForward } from "lucide-react";
import { usePomodoroStore } from "../store/pomodoroStore";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";

interface PomodoroCoreProps {
  compact?: boolean;
}

const PomodoroCore: React.FC<PomodoroCoreProps> = ({ compact = false }) => {
  const {
    mode,
    isActive,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    handleModeChange,
    handleSkipForward,
  } = usePomodoroStore();

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <Tabs
        value={mode}
        onValueChange={handleModeChange as (value: string) => void}
        className="w-full"
      >
        <TabsList className={`grid w-full grid-cols-3 ${compact ? "h-8" : ""}`}>
          <TabsTrigger value="work" className={compact ? "text-xs" : ""}>
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="shortBreak" className={compact ? "text-xs" : ""}>
            Short Break
          </TabsTrigger>
          <TabsTrigger value="longBreak" className={compact ? "text-xs" : ""}>
            Long Break
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          "font-mono font-semibold",
          compact ? "text-3xl" : "text-6xl",
        )}
      >
        {formatTime(timeLeft)}
      </div>

      <div className="flex flex-row justify-between w-full">
        <Button
          variant="ghost"
          onClick={resetTimer}
          aria-label="Reset"
          size={compact ? "icon" : "default"}
          className={compact ? "h-8 w-8" : ""}
        >
          <RotateCw className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
        <div className="flex justify-center items-center gap-2">
          <Button
            size={compact ? "sm" : "lg"}
            variant="outline"
            onClick={isActive ? pauseTimer : startTimer}
            aria-label={isActive ? "Pause" : "Start"}
            className={compact ? "w-20" : "w-24"}
          >
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkipForward}
            aria-label="Skip Forward"
            size={compact ? "icon" : "default"}
            className={compact ? "h-8 w-8" : ""}
          >
            <SkipForward className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </Button>
        </div>
        <div />
      </div>
    </div>
  );
};

export default PomodoroCore;
