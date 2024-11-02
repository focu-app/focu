import { useChatStore, type ThrottleSpeed } from "@/app/store/chatStore";
import { useCheckInStore } from "@/app/store/checkinStore";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Switch } from "@repo/ui/components/ui/switch";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function GeneralSettings() {
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
