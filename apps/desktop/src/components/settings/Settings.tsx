"use client";
import { useOllamaStore } from "@/store/ollamaStore";
import type { useToast } from "@repo/ui/hooks/use-toast";
import { ChatSettings } from "./ChatSettings";
import { CheckInSettings } from "./CheckInSettings";
import { DataSettings } from "./DataSettings";
import { GeneralSettings } from "./GeneralSettings";
import { HomeScreenSettings } from "./HomeScreenSettings";
import { ModelSettings } from "./ModelSettings";
import { PomodoroSettings } from "./PomodoroSettings";
import { SettingsSidebar } from "./SettingsSidebar";
import { ShortcutSettings } from "./ShortcutSettings";
import { TemplateSettings } from "./TemplateSettings";

export const showSettingsSavedToast = (
  toast: ReturnType<typeof useToast>["toast"],
) => {
  toast({
    title: "Settings saved",
  });
};

export function Settings() {
  const { settingsCategory, setSettingsCategory } = useOllamaStore();

  const renderContent = () => {
    switch (settingsCategory) {
      case "General":
        return <GeneralSettings />;
      case "AI Models":
        return <ModelSettings />;
      case "Chat":
        return <ChatSettings />;
      case "Pomodoro":
        return <PomodoroSettings />;
      case "Shortcuts":
        return <ShortcutSettings />;
      case "Templates":
        return <TemplateSettings />;
      case "Check-in":
        return <CheckInSettings />;
      case "Homescreen":
        return <HomeScreenSettings />;
      case "Data":
        return <DataSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row h-full w-full overflow-hidden">
      <SettingsSidebar
        activeCategory={settingsCategory}
        setActiveCategory={setSettingsCategory}
      />
      <div className="flex-grow overflow-hidden h-full bg-background/80 dark:bg-background/90">
        {renderContent()}
      </div>
    </div>
  );
}
