"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";
import { RotateCw, SkipForward } from "lucide-react";
import { usePomodoroStore } from "../store/pomodoroStore";

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
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
  } = usePomodoroStore();

  const getOriginalDuration = () => {
    switch (mode) {
      case "work":
        return customWorkDuration;
      case "shortBreak":
        return customShortBreakDuration;
      case "longBreak":
        return customLongBreakDuration;
    }
  };

  const showResetButton = !isActive && timeLeft !== getOriginalDuration();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 w-full h-full",
        !compact ? "min-h-[250px]" : "",
      )}
    >
      <Tabs
        value={mode}
        onValueChange={handleModeChange as (value: string) => void}
        className="w-full md:mt-4"
      >
        <TabsList className={"grid w-full grid-cols-3"}>
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
          "flex-grow flex flex-col justify-center items-center",
          compact ? "gap-4" : "gap-8",
        )}
      >
        <div
          className={cn(
            "font-mono font-semibold",
            compact ? "text-3xl" : "text-6xl",
          )}
        >
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center items-center w-full">
          <div className="relative">
            <div className={`relative ${compact ? "w-24" : "w-30"}`}>
              {showResetButton && (
                <Button
                  size={compact ? "icon" : "icon"}
                  variant="ghost"
                  onClick={resetTimer}
                  aria-label="Reset"
                  className={cn(
                    "absolute right-full mr-2",
                    compact ? "w-8 h-8" : "w-10 h-10",
                  )}
                >
                  <RotateCw className={compact ? "h-4 w-4" : "h-5 w-5"} />
                </Button>
              )}
              <Button
                size={compact ? "sm" : "lg"}
                variant="outline"
                onClick={isActive ? pauseTimer : startTimer}
                aria-label={isActive ? "Pause" : "Start"}
                className="w-full"
              >
                {isActive ? "Pause" : "Start"}
              </Button>
            </div>
            <div
              className={`absolute ${compact ? "-right-8" : "-right-14"} top-0`}
            >
              {isActive && (
                <Button
                  variant="ghost"
                  onClick={handleSkipForward}
                  aria-label="Skip Forward"
                  size={compact ? "icon" : "default"}
                  className={compact ? "h-8 w-8" : ""}
                >
                  <SkipForward className={compact ? "h-4 w-4" : "h-5 w-5"} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroCore;
