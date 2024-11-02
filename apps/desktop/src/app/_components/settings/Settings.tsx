"use client";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Switch } from "@repo/ui/components/ui/switch";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { useOllamaStore } from "../../store";
import { type ThrottleSpeed, useChatStore } from "../../store/chatStore";
import { useLicenseStore } from "../../store/licenseStore";
import { usePomodoroStore } from "../../store/pomodoroStore";
import { ShortcutInput } from "../ShortcutInput";
import { Templates } from "../Templates";
import { useCheckInStore } from "../../store/checkinStore";
import { SettingsCard } from "./SettingsCard";
import { SettingsSidebar } from "./SettingsSidebar";
import { ModelSettings } from "./ModelSettings";

export type Category =
  | "General"
  | "AI"
  | "Pomodoro"
  | "Shortcuts"
  | "Templates";

export const showSettingsSavedToast = (
  toast: ReturnType<typeof useToast>["toast"],
) => {
  toast({
    title: "Settings saved",
    duration: 3000,
  });
};

function GeneralSettings() {
  const { toast } = useToast();
  const {
    checkInEnabled,
    setCheckInEnabled,
    checkInInterval,
    setCheckInInterval,
    checkInFocusWindow,
    setCheckInFocusWindow,
  } = useCheckInStore();

  const {
    throttleResponse,
    setThrottleResponse,
    throttleSpeed,
    setThrottleSpeed,
  } = useChatStore();

  const [localInterval, setLocalInterval] = useState(
    checkInInterval / (60 * 1000),
  );
  const [localThrottleSpeed, setLocalThrottleSpeed] =
    useState<ThrottleSpeed>(throttleSpeed);
  const [localCheckInEnabled, setLocalCheckInEnabled] =
    useState(checkInEnabled);
  const [localCheckInFocusWindow, setLocalCheckInFocusWindow] =
    useState(checkInFocusWindow);

  const handleSave = () => {
    const newValue = Math.max(1, localInterval) * 60 * 1000;
    setCheckInInterval(newValue);
    setThrottleSpeed(localThrottleSpeed);
    setCheckInEnabled(localCheckInEnabled);
    setCheckInFocusWindow(localCheckInFocusWindow);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="General Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <div className="flex flex-col gap-2">
            <Label>Theme</Label>
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Check-in</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-in-enabled">Check-In Enabled</Label>
            <Switch
              id="check-in-enabled"
              checked={localCheckInEnabled}
              onCheckedChange={setLocalCheckInEnabled}
            />
          </div>
          {localCheckInEnabled && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="check-in-enabled">
                  Focus window on check-in
                </Label>
                <Switch
                  id="check-in-focus-window"
                  checked={localCheckInFocusWindow}
                  onCheckedChange={setLocalCheckInFocusWindow}
                />
              </div>
              <div>
                <Label htmlFor="check-in-interval">
                  Check-in Interval (minutes)
                </Label>
                <Input
                  id="check-in-interval"
                  type="number"
                  value={localInterval}
                  onChange={(e) => setLocalInterval(Number(e.target.value))}
                  min={1}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">AI Text</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="throttle-response">Throttle AI Response</Label>
            <Switch
              id="throttle-response"
              checked={throttleResponse}
              onCheckedChange={setThrottleResponse}
            />
          </div>
          {throttleResponse && (
            <div className="flex flex-col gap-2">
              <Label>Throttle Speed</Label>
              <RadioGroup
                value={localThrottleSpeed}
                onValueChange={(value) =>
                  setLocalThrottleSpeed(value as ThrottleSpeed)
                }
              >
                {["slow", "medium", "fast"].map((speed) => (
                  <div key={speed} className="flex items-center space-x-2">
                    <RadioGroupItem value={speed} id={speed} />
                    <Label htmlFor={speed} className="capitalize">
                      {speed}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}

function PomodoroSettings() {
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

function ShortcutSettings() {
  const { globalShortcut, setGlobalShortcut } = useOllamaStore();
  const { toast } = useToast();
  const [localShortcut, setLocalShortcut] = useState(globalShortcut);

  const handleSave = async () => {
    try {
      await setGlobalShortcut(localShortcut);
      showSettingsSavedToast(toast);
    } catch (error) {
      console.error("Failed to set global shortcut:", error);
      toast({
        title: "Error",
        description: "Failed to set global shortcut. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleResetToDefault = async () => {
    const defaultShortcut = "Command+Shift+I";
    setLocalShortcut(defaultShortcut);
    try {
      await setGlobalShortcut(defaultShortcut);
      showSettingsSavedToast(toast);
    } catch (error) {
      console.error("Failed to reset global shortcut:", error);
      toast({
        title: "Error",
        description: "Failed to reset global shortcut. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <SettingsCard title="Shortcut Settings" onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="global-shortcut">Open Focu</Label>
        <div className="flex items-center gap-2">
          <ShortcutInput
            key={localShortcut} // Add this line
            value={localShortcut}
            onChange={setLocalShortcut}
          />
          <Button onClick={handleResetToDefault} size="sm">
            Reset to Default
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

export function Settings() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const { instanceId } = useLicenseStore();
  const renderContent = () => {
    switch (activeCategory) {
      case "General":
        return <GeneralSettings />;
      case "AI":
        return <ModelSettings />;
      case "Pomodoro":
        return <PomodoroSettings />;
      case "Shortcuts":
        return <ShortcutSettings />;
      case "Templates":
        return <Templates />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row h-full w-full overflow-hidden">
      <SettingsSidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <div className="flex-grow overflow-hidden h-full">{renderContent()}</div>
    </div>
  );
}
