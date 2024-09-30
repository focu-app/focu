"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { usePomodoroStore } from "../store/pomodoroStore";
import PomodoroCore from "../_components/PomodoroCore";

const PomodoroTimer = () => {
  const {
    mode,
    isActive,
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    showSettings,
    setCustomWorkDuration,
    setCustomShortBreakDuration,
    setCustomLongBreakDuration,
    setShowSettings,
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
      <div className="flex flex-col flex-end gap-8 border bg-gray-100 dark:bg-gray-700 rounded-md p-4">
        <PomodoroCore />
        <Button
          variant="ghost"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          size="icon"
        >
          <Settings className="h-4 w-4" />
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
