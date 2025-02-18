import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAppStore } from "@/store/appStore";
import { isRegistered, register } from "@tauri-apps/plugin-global-shortcut";

export type SettingsCategory =
  | "General"
  | "Local AI"
  | "OpenAI"
  | "OpenRouter"
  | "OpenAI Compatible"
  | "Chat"
  | "Pomodoro"
  | "Shortcuts"
  | "Templates"
  | "Check-in"
  | "Homescreen"
  | "Data";

interface SettingsState {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  settingsCategory: SettingsCategory;
  setSettingsCategory: (category: SettingsCategory) => void;
  closeOnEscape: boolean;
  setCloseOnEscape: (close: boolean) => void;
  automaticUpdatesEnabled: boolean;
  setAutomaticUpdatesEnabled: (enabled: boolean) => void;
  automaticDownloadEnabled: boolean;
  setAutomaticDownloadEnabled: (enabled: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  visibleChatTypes: {
    morning: boolean;
    evening: boolean;
    "year-end": boolean;
  };
  setVisibleChatTypes: (types: {
    morning: boolean;
    evening: boolean;
    "year-end": boolean;
  }) => void;
  globalShortcut: string;
  setGlobalShortcut: (shortcut: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
      settingsCategory: "General",
      setSettingsCategory: (category: SettingsCategory) =>
        set({ settingsCategory: category }),
      closeOnEscape: false,
      setCloseOnEscape: (close: boolean) => set({ closeOnEscape: close }),
      automaticUpdatesEnabled: true,
      setAutomaticUpdatesEnabled: (enabled: boolean) =>
        set({ automaticUpdatesEnabled: enabled }),
      automaticDownloadEnabled: false,
      setAutomaticDownloadEnabled: (enabled: boolean) =>
        set({ automaticDownloadEnabled: enabled }),
      selectedLanguage: "English",
      setSelectedLanguage: (language: string) =>
        set({ selectedLanguage: language }),
      visibleChatTypes: {
        morning: true,
        evening: true,
        "year-end": false,
      },
      setVisibleChatTypes: (types) => set({ visibleChatTypes: types }),
      globalShortcut: "Command+Shift+I",
      setGlobalShortcut: async (shortcut: string) => {
        const { registerGlobalShortcut, unregisterGlobalShortcut } =
          useAppStore.getState();
        const currentShortcut = useSettingsStore.getState().globalShortcut;
        if (currentShortcut !== shortcut) {
          try {
            await unregisterGlobalShortcut();
            const alreadyRegistered = await isRegistered(shortcut);
            if (!alreadyRegistered) {
              const { showMainWindow } = useAppStore.getState();
              await register(shortcut, showMainWindow);
              set({ globalShortcut: shortcut });
            }
          } catch (error) {
            console.error("Error setting global shortcut:", error);
            await registerGlobalShortcut();
            throw error;
          }
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useSettingsStore);
