import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

const STORE_PATH = "settings.json";
const SETTINGS_KEY = "app-settings";

export type Settings = {
  hideWindowInsteadOfClose: boolean;
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    hideWindowInsteadOfClose: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const store = await Store.load(STORE_PATH);
      const loadedSettings = await store.get<Settings>(SETTINGS_KEY);
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const store = await Store.load(STORE_PATH);
      const updatedSettings = { ...settings, ...newSettings };
      await store.set(SETTINGS_KEY, updatedSettings);
      await store.save();
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
  };
}
