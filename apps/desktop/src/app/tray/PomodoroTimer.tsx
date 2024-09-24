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
    showSettings,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomWorkDuration,
    setCustomShortBreakDuration,
    setCustomLongBreakDuration,
    setShowSettings,
    formatTime,
    handleModeChange,
    handleSkipForward,
    setTimeLeft,
  } = usePomodoroStore();

  const handleSetCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
    if (!isActive) {
      setTimeLeft(
        mode === "work" ? customWorkDuration : customShortBreakDuration,
      );
    }
  };

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

      <div className="flex flex-col items-center gap-8 border bg-gray-100 dark:bg-gray-700 rounded-md p-2 py-8">
        <div className="text-6xl font-mono">{formatTime(timeLeft)}</div>

        <div className="flex justify-center items-center gap-4">
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
      </div>

      <div className="flex justify-between">
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
