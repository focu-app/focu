import { useChatStore, type ThrottleSpeed } from "@/app/store/chatStore";
import { useCheckInStore } from "@/app/store/checkinStore";
import { useOllamaStore } from "@/app/store";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Switch } from "@repo/ui/components/ui/switch";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { SettingItem } from "./SettingItem";

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

  const {
    automaticUpdatesEnabled,
    setAutomaticUpdatesEnabled,
    automaticDownloadEnabled,
    setAutomaticDownloadEnabled,
  } = useOllamaStore();

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
          <SettingItem label="Theme">
            <ModeToggle />
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Updates</h2>
          <SettingItem label="Enable Automatic Updates">
            <Switch
              id="automatic-updates"
              checked={automaticUpdatesEnabled}
              onCheckedChange={setAutomaticUpdatesEnabled}
            />
          </SettingItem>
          {automaticUpdatesEnabled && (
            <SettingItem label="Enable Automatic Download">
              <Switch
                id="automatic-download"
                checked={automaticDownloadEnabled}
                onCheckedChange={setAutomaticDownloadEnabled}
              />
            </SettingItem>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Check-in</h2>
          <SettingItem
            label="Check-In Enabled"
            tooltip="Enables periodic check-ins to help you stay focused and track your progress"
          >
            <Switch
              id="check-in-enabled"
              checked={localCheckInEnabled}
              onCheckedChange={setLocalCheckInEnabled}
            />
          </SettingItem>

          {localCheckInEnabled && (
            <>
              <SettingItem
                label="Focus window on check-in"
                tooltip="Automatically brings the application window to front when it's time to check in"
              >
                <Switch
                  id="check-in-focus-window"
                  checked={localCheckInFocusWindow}
                  onCheckedChange={setLocalCheckInFocusWindow}
                />
              </SettingItem>

              <SettingItem
                label="Check-in Interval (minutes)"
                tooltip="How often you want to be prompted for check-ins"
              >
                <Input
                  id="check-in-interval"
                  type="number"
                  value={localInterval}
                  onChange={(e) => setLocalInterval(Number(e.target.value))}
                  min={1}
                />
              </SettingItem>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">AI Text</h2>
          <SettingItem
            label="Throttle AI Response"
            tooltip="Controls whether AI responses appear instantly or are typed out gradually"
          >
            <Switch
              id="throttle-response"
              checked={throttleResponse}
              onCheckedChange={setThrottleResponse}
            />
          </SettingItem>

          {throttleResponse && (
            <SettingItem
              label="Throttle Speed"
              tooltip="Adjust how quickly the AI response text appears on screen"
            >
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
            </SettingItem>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
