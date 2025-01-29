"use client";
import { useState } from "react";
import { TemplateSettings } from "./TemplateSettings";
import { SettingsSidebar } from "./SettingsSidebar";
import { ModelSettings } from "./ModelSettings";
import { GeneralSettings } from "./GeneralSettings";
import { PomodoroSettings } from "./PomodoroSettings";
import { ShortcutSettings } from "./ShortcutSettings";
import { CheckInSettings } from "./CheckInSettings";
import { HomeScreenSettings } from "./HomeScreenSettings";
import { ChatSettings } from "./ChatSettings";
import type { useToast } from "@repo/ui/hooks/use-toast";
import { useOllamaStore } from "@/app/store";

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
