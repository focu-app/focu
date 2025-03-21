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
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { useAIProviderStore } from "./aiProviderStore";

interface AppState {
  initializeApp: () => Promise<void>;
  showMainWindow: () => Promise<void>;
  closeMainWindow: () => Promise<void>;
  isAppLoading: boolean;
  setIsAppLoading: (isLoading: boolean) => void;
  registerGlobalShortcut: () => Promise<void>;
  unregisterGlobalShortcut: () => Promise<void>;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
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
      onboardingCompleted: false,
      setOnboardingCompleted: (completed: boolean) =>
        set({ onboardingCompleted: completed }),
      registerGlobalShortcut: async () => {
        const { globalShortcut } = useSettingsStore.getState();
        try {
          const alreadyRegistered = await isRegistered(globalShortcut);
          if (!alreadyRegistered) {
            const { showMainWindow } = useAppStore.getState();
            await register(globalShortcut, showMainWindow);
          }
        } catch (error) {
          console.error("Error registering global shortcut:", error);
        }
      },
      unregisterGlobalShortcut: async () => {
        const { globalShortcut } = useSettingsStore.getState();
        try {
          const isCurrentlyRegistered = await isRegistered(globalShortcut);
          if (isCurrentlyRegistered) {
            await unregister(globalShortcut);
          }
        } catch (error) {
          console.error("Error unregistering global shortcut:", error);
        }
      },
      initializeApp: async () => {
        const { checkOllamaStatus, fetchInstalledModels } =
          useOllamaStore.getState();
        const { setSelectedDate, contextWindowSize } = useChatStore.getState();
        const { resetTimer, setIntervalId, handleModeChange } =
          usePomodoroStore.getState();
        const { setSettingsCategory } = useSettingsStore.getState();
        const { setIsAppLoading, registerGlobalShortcut } = get();

        useOllamaStore.subscribe((state, prevState) => {
          // only if isOllamaRunning, installedModels or customModels changed
          if (
            state.isOllamaRunning !== prevState.isOllamaRunning ||
            state.installedModels.length !== prevState.installedModels.length ||
            state.customModels.length !== prevState.customModels.length
          ) {
            useAIProviderStore.getState().syncOllamaModels();
          }
        });

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
          const { activeModel, getModelProvider } =
            useAIProviderStore.getState();
          if (activeModel && getModelProvider(activeModel) === "ollama") {
            invoke("start_ollama");

            const waitForOllama = async (
              timeoutMs = 2500,
            ): Promise<boolean> => {
              const startTime = Date.now();
              while (Date.now() - startTime < timeoutMs) {
                const { isOllamaRunning } = useOllamaStore.getState();
                if (isOllamaRunning) {
                  return true;
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
                await checkOllamaStatus();
              }
              return false;
            };

            const isRunning = await waitForOllama();
            if (isRunning) {
              const ollama = (await import("ollama/browser")).default;
              await ollama.generate({
                model: activeModel,
                prompt: "",
                keep_alive: "10m",
                options: { num_ctx: contextWindowSize },
              });
            } else {
              console.warn("Ollama failed to start within 2.5 seconds");
            }
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
