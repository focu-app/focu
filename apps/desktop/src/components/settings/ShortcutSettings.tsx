import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { ShortcutInput } from "../shortcuts/ShortcutInput";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { useSettingsStore } from "@/store/settingsStore";

export function ShortcutSettings() {
  const { globalShortcut, setGlobalShortcut } = useSettingsStore();
  const { toast } = useToast();
  const [localShortcut, setLocalShortcut] = useState(globalShortcut);

  const handleSave = async () => {
    try {
      await setGlobalShortcut(localShortcut);
      showSettingsSavedToast(toast);
    } catch (error) {
      console.error("Failed to save shortcut settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
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
      });
    }
  };

  return (
    <SettingsCard title="Shortcut Settings" onSave={handleSave}>
      <div className="flex flex-col gap-4">
        <SettingItem
          label="Open Focu"
          tooltip="Open the app from anywhere when the app is in the background"
        >
          <div className="flex items-center gap-2">
            <ShortcutInput
              key={localShortcut}
              value={localShortcut}
              onChange={setLocalShortcut}
            />
            <Button onClick={handleResetToDefault} size="sm">
              Reset to Default
            </Button>
          </div>
        </SettingItem>
      </div>
    </SettingsCard>
  );
}
