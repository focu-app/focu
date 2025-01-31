import { usePomodoroStore } from "@/store/pomodoroStore";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function PomodoroSettings() {
  const {
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    setCustomWorkDuration,
    setCustomShortBreakDuration,
    setCustomLongBreakDuration,
  } = usePomodoroStore();
  const { toast } = useToast();
  const [localWorkDuration, setLocalWorkDuration] = useState(
    customWorkDuration / 60,
  );
  const [localShortBreakDuration, setLocalShortBreakDuration] = useState(
    customShortBreakDuration / 60,
  );
  const [localLongBreakDuration, setLocalLongBreakDuration] = useState(
    customLongBreakDuration / 60,
  );

  const handleSave = () => {
    setCustomWorkDuration(Math.max(1, localWorkDuration) * 60);
    setCustomShortBreakDuration(Math.max(1, localShortBreakDuration) * 60);
    setCustomLongBreakDuration(Math.max(1, localLongBreakDuration) * 60);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="Pomodoro Settings" onSave={handleSave}>
      <form className="flex flex-row gap-4">
        <div>
          <Label htmlFor="work-duration">Pomodoro (minutes)</Label>
          <Input
            id="work-duration"
            type="number"
            value={localWorkDuration}
            onChange={(e) => setLocalWorkDuration(Number(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="short-break-duration">Short Break (minutes)</Label>
          <Input
            id="short-break-duration"
            type="number"
            value={localShortBreakDuration}
            onChange={(e) => setLocalShortBreakDuration(Number(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="long-break-duration">Long Break (minutes)</Label>
          <Input
            id="long-break-duration"
            type="number"
            value={localLongBreakDuration}
            onChange={(e) => setLocalLongBreakDuration(Number(e.target.value))}
            min={1}
          />
        </div>
      </form>
    </SettingsCard>
  );
}
