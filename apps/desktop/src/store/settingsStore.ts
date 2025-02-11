import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SettingsCategory =
  | "General"
  | "AI Models"
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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
      settingsCategory: "General",
      setSettingsCategory: (category: SettingsCategory) =>
        set({ settingsCategory: category }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useSettingsStore);
