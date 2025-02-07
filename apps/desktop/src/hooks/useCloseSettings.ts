import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

const STORE_PATH = "settings.json";
const CLOSE_BEHAVIOR_KEY = "window-close-behavior";

export type CloseSettings = {
  hideInsteadOfClose: boolean;
};

export function useCloseSettings() {
  const [hideInsteadOfClose, setHideInsteadOfClose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const store = await Store.load(STORE_PATH);
      const settings = await store.get<CloseSettings>(CLOSE_BEHAVIOR_KEY);
      if (settings) {
        setHideInsteadOfClose(settings.hideInsteadOfClose);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load close settings:", error);
      setIsLoading(false);
    }
  };

  const updateSettings = async (hideInsteadOfClose: boolean) => {
    try {
      const store = await Store.load(STORE_PATH);
      await store.set(CLOSE_BEHAVIOR_KEY, { hideInsteadOfClose });
      await store.save();
      setHideInsteadOfClose(hideInsteadOfClose);
    } catch (error) {
      console.error("Failed to save close settings:", error);
    }
  };

  return {
    hideInsteadOfClose,
    setHideInsteadOfClose: updateSettings,
    isLoading,
  };
}
