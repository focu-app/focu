import { useOllamaStore } from "@/app/store";
import { Switch } from "@repo/ui/components/ui/switch";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle";
import { useToast } from "@repo/ui/hooks/use-toast";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function GeneralSettings() {
  const { toast } = useToast();

  const {
    automaticUpdatesEnabled,
    setAutomaticUpdatesEnabled,
    automaticDownloadEnabled,
    setAutomaticDownloadEnabled,
  } = useOllamaStore();

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="General Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <SettingItem label="Theme">
            <div className="relative">
              <ModeToggle />
            </div>
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Updates</h2>
          <SettingItem label="Automatically check for updates">
            <Switch
              id="automatic-updates"
              checked={automaticUpdatesEnabled}
              onCheckedChange={setAutomaticUpdatesEnabled}
            />
          </SettingItem>
          {automaticUpdatesEnabled && (
            <SettingItem label="Automatically install updates">
              <Switch
                id="automatic-download"
                checked={automaticDownloadEnabled}
                onCheckedChange={setAutomaticDownloadEnabled}
              />
            </SettingItem>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
