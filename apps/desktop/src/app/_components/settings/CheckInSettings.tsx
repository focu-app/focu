import { useCheckInStore } from "@/app/store/checkinStore";
import { Input } from "@repo/ui/components/ui/input";
import { Switch } from "@repo/ui/components/ui/switch";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function CheckInSettings() {
  const { toast } = useToast();
  const {
    checkInEnabled,
    setCheckInEnabled,
    checkInInterval,
    setCheckInInterval,
    checkInFocusWindow,
    setCheckInFocusWindow,
  } = useCheckInStore();

  const [localInterval, setLocalInterval] = useState(
    checkInInterval / (60 * 1000),
  );
  const [localCheckInEnabled, setLocalCheckInEnabled] =
    useState(checkInEnabled);
  const [localCheckInFocusWindow, setLocalCheckInFocusWindow] =
    useState(checkInFocusWindow);

  const handleSave = () => {
    const newValue = Math.max(1, localInterval) * 60 * 1000;
    setCheckInInterval(newValue);
    setCheckInEnabled(localCheckInEnabled);
    setCheckInFocusWindow(localCheckInFocusWindow);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="Check-in Settings" onSave={handleSave}>
      <div className="flex flex-col gap-4">
        <SettingItem
          label="Periodic Check-In Enabled"
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
                className="w-32"
              />
            </SettingItem>
          </>
        )}
      </div>
    </SettingsCard>
  );
}
