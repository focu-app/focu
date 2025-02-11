import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./chatStore";
import { usePomodoroStore } from "./pomodoroStore";
import { format } from "date-fns";
import {
  setupBackupManager,
  startAutomaticBackups,
} from "@/database/backup-manager";
import { useOllamaStore } from "./ollamaStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { useSettingsStore } from "@/store/settingsStore";

interface AppState {
  initializeApp: () => Promise<void>;
  showMainWindow: () => Promise<void>;
  closeMainWindow: () => Promise<void>;
  isAppLoading: boolean;
  setIsAppLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAppLoading: false,
      setIsAppLoading: (isLoading: boolean) => set({ isAppLoading: isLoading }),
      showMainWindow: async () => {
        const mainWindow = await WebviewWindow.getByLabel("main");
        if (mainWindow) {
          await mainWindow.show();
          await mainWindow.setFocus();
        }
        await invoke("set_dock_icon_visibility", { visible: true });
      },
      closeMainWindow: async () => {
        const mainWindow = await WebviewWindow.getByLabel("main");
        if (mainWindow) {
          await mainWindow.hide();
        }
        await invoke("set_dock_icon_visibility", { visible: false });
      },
      initializeApp: async () => {
        const {
          checkOllamaStatus,
          registerGlobalShortcut,
          fetchInstalledModels,
        } = useOllamaStore.getState();
        const { setSelectedDate, contextWindowSize } = useChatStore.getState();
        const { resetTimer, setIntervalId, handleModeChange } =
          usePomodoroStore.getState();
        const { setSettingsCategory } = useSettingsStore.getState();
        const { setIsAppLoading } = get();

        setIsAppLoading(true);
        const dateString = format(new Date(), "yyyy-MM-dd");
        setSelectedDate(dateString);
        resetTimer();
        handleModeChange("work");
        setIntervalId(null);
        setSettingsCategory("General");
        try {
          await setupBackupManager();
          startAutomaticBackups();

          await checkOllamaStatus();
          await registerGlobalShortcut();
          await fetchInstalledModels();
          const { activeModel } = useOllamaStore.getState();
          if (activeModel) {
            const ollama = (await import("ollama/browser")).default;
            await ollama.generate({
              model: activeModel,
              prompt: "",
              keep_alive: "10m",
              options: { num_ctx: contextWindowSize },
            });
          }
        } catch (error) {
          console.error("Error initializing app:", error);
        } finally {
          setIsAppLoading(false);
        }
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useAppStore);
