import { Switch } from "@repo/ui/components/ui/switch";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { useSettingsStore } from "@/store/settingsStore";

export function HomeScreenSettings() {
  const { toast } = useToast();

  const { visibleChatTypes, setVisibleChatTypes } = useSettingsStore();

  const [localVisibleChatTypes, setLocalVisibleChatTypes] =
    useState(visibleChatTypes);

  const handleSave = () => {
    setVisibleChatTypes(localVisibleChatTypes);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="Homescreen Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Visible Chat Cards</h2>
          <SettingItem
            label="Show Morning Intention"
            tooltip="Controls whether the Morning Intention chat card is shown on the home screen"
          >
            <Switch
              id="show-morning"
              checked={localVisibleChatTypes.morning}
              onCheckedChange={(checked) =>
                setLocalVisibleChatTypes({
                  ...localVisibleChatTypes,
                  morning: checked,
                })
              }
            />
          </SettingItem>

          <SettingItem
            label="Show Evening Reflection"
            tooltip="Controls whether the Evening Reflection chat card is shown on the home screen"
          >
            <Switch
              id="show-evening"
              checked={localVisibleChatTypes.evening}
              onCheckedChange={(checked) =>
                setLocalVisibleChatTypes({
                  ...localVisibleChatTypes,
                  evening: checked,
                })
              }
            />
          </SettingItem>

          <SettingItem
            label="Show Year-End Reflection"
            tooltip="Controls whether the Year-End Reflection chat card is shown on the home screen"
          >
            <Switch
              id="show-year-end"
              checked={localVisibleChatTypes["year-end"]}
              onCheckedChange={(checked) =>
                setLocalVisibleChatTypes({
                  ...localVisibleChatTypes,
                  "year-end": checked,
                })
              }
            />
          </SettingItem>
        </div>
      </div>
    </SettingsCard>
  );
}
