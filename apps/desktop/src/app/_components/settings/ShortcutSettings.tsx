import { useOllamaStore } from "@/app/store";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { ShortcutInput } from "../ShortcutInput";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function ShortcutSettings() {
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
