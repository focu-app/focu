import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/api/globalShortcut";
import { invoke } from "@tauri-apps/api/tauri";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./store/chatStore";
import { usePomodoroStore } from "./store/pomodoroStore";
import { toast } from "@repo/ui/hooks/use-toast";

interface ModelOption {
  name: string;
  size: string;
  recommended?: boolean;
}

interface OllamaState {
  selectedModel: string | null;
  installedModels: string[];
  activeModel: string | null;
  pullProgress: { [key: string]: number };
  isPulling: { [key: string]: boolean };
  pullStreams: { [key: string]: AsyncIterable<any> | null };
  fetchInstalledModels: () => Promise<void>;
  setSelectedModel: (model: string | null) => void;
  pullModel: (model: string) => Promise<void>;
  stopPull: (model: string) => void;
  activateModel: (model: string | null) => Promise<void>;
  isOllamaRunning: boolean;
  checkOllamaStatus: () => Promise<void>;
  startOllama: () => Promise<void>;
  activatingModel: string | null;
  deactivatingModel: string | null;
  initializeApp: () => Promise<void>;
  isModelLoading: boolean;
  globalShortcut: string;
  setGlobalShortcut: (shortcut: string) => Promise<void>;
  getGlobalShortcut: () => string;
  registerGlobalShortcut: () => Promise<void>;
  unregisterGlobalShortcut: () => Promise<void>;
  showMainWindow: () => Promise<void>;
  closeMainWindow: () => Promise<void>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  isCheckInOpen: boolean;
  setIsCheckInOpen: (isOpen: boolean) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  checkInInterval: number;
  setCheckInInterval: (interval: number) => void;
  isShortcutDialogOpen: boolean;
  setIsShortcutDialogOpen: (isOpen: boolean) => void;
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (isOpen: boolean) => void;
  defaultModels: ModelOption[];
  modelOptions: ModelOption[];
  addModelOption: (model: ModelOption) => void;
  removeModelOption: (modelName: string) => void;
}

export const useOllamaStore = create<OllamaState>()(
  persist(
    (set, get) => ({
      selectedModel: null,
      installedModels: [],
      activeModel: null,
      pullProgress: {},
      isPulling: {},
      pullStreams: {},
      activatingModel: null,
      deactivatingModel: null,
      isOllamaRunning: false,
      isModelLoading: false,
      globalShortcut: "Command+Shift+I",
      isSettingsOpen: false,
      setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
      isCheckInOpen: false,
      setIsCheckInOpen: (isOpen: boolean) => set({ isCheckInOpen: isOpen }),
      onboardingCompleted: false,
      setOnboardingCompleted: (completed: boolean) =>
        set({ onboardingCompleted: completed }),
      isCommandMenuOpen: false,
      setIsCommandMenuOpen: (isOpen: boolean) => set({ isCommandMenuOpen: isOpen }),
      defaultModels: [
        { name: "llama3.2:latest", size: "~2GB", recommended: true },
        { name: "llama3.1:latest", size: "~4GB" },
      ],
      modelOptions: [
        { name: "llama3.2:latest", size: "~2GB", recommended: true },
        { name: "llama3.1:latest", size: "~4GB" },
      ],
      addModelOption: (model: ModelOption) =>
        set((state) => ({
          modelOptions: [...state.modelOptions, model],
        })),
      removeModelOption: (modelName: string) =>
        set((state) => ({
          modelOptions: state.modelOptions.filter((m) => m.name !== modelName),
        })),
      setGlobalShortcut: async (shortcut: string) => {
        const currentShortcut = get().globalShortcut;
        if (currentShortcut !== shortcut) {
          try {
            await get().unregisterGlobalShortcut();
            const alreadyRegistered = await isRegistered(shortcut);
            if (!alreadyRegistered) {
              await register(shortcut, get().showMainWindow);
              set({ globalShortcut: shortcut });
              console.log("New shortcut registered:", shortcut);
            } else {
              console.warn("Shortcut already registered:", shortcut);
              // Optionally, you might want to inform the user or handle this case
            }
          } catch (error) {
            console.error("Error setting global shortcut:", error);
            // If registration fails, revert to the old shortcut
            await get().registerGlobalShortcut();
            throw error;
          }
        }
      },

      getGlobalShortcut: () => get().globalShortcut,

      showMainWindow: async () => {
        console.log("Shortcut triggered");
        const { WebviewWindow } = await import("@tauri-apps/api/window");
        await WebviewWindow.getByLabel("main")?.show();
        await WebviewWindow.getByLabel("main")?.setFocus();
        await invoke("set_dock_icon_visibility", { visible: true });
      },

      closeMainWindow: async () => {
        const { WebviewWindow } = await import("@tauri-apps/api/window");
        const { invoke } = await import("@tauri-apps/api/tauri");

        await WebviewWindow.getByLabel("main")?.hide();
        await invoke("set_dock_icon_visibility", { visible: false });
      },

      fetchInstalledModels: async () => {
        try {
          const models = await ollama.list();
          set({
            installedModels: models.models.map((model) => model.name),
            isOllamaRunning: true,
          });
        } catch (error) {
          set({ isOllamaRunning: false });
          console.error("Error fetching installed models:", error);
        }
      },

      setSelectedModel: (model) => set({ selectedModel: model }),

      pullModel: async (model) => {
        set((state) => ({
          isPulling: { ...state.isPulling, [model]: true },
          pullProgress: { ...state.pullProgress, [model]: 0 },
        }));

        try {
          const stream = await ollama.pull({ model, stream: true });
          set((state) => ({
            pullStreams: { ...state.pullStreams, [model]: stream },
          }));

          for await (const chunk of stream) {
            if ("total" in chunk && "completed" in chunk) {
              const percentage = Math.round(
                (chunk.completed / chunk.total) * 100,
              );
              set((state) => ({
                pullProgress: { ...state.pullProgress, [model]: percentage },
              }));
            }
          }

          await get().fetchInstalledModels();
          toast({
            title: "Model downloaded successfully",
            description: `The model ${model} has been downloaded and installed.`,
            duration: 3000,
          });
        } catch (error) {
          console.error(`Error pulling model ${model}:`, error);
          toast({
            title: "Error downloading model",
            description: `Failed to download model ${model}. Please try again.`,
            variant: "destructive",
            duration: 5000,
          });
        } finally {
          set((state) => ({
            isPulling: { ...state.isPulling, [model]: false },
            pullProgress: { ...state.pullProgress, [model]: 0 },
            pullStreams: { ...state.pullStreams, [model]: null },
          }));
        }
      },

      stopPull: (model) => {
        const { pullStreams } = get();
        const stream = pullStreams[model];
        if (stream && "abort" in stream) {
          (stream as any).abort();
          set((state) => ({
            isPulling: { ...state.isPulling, [model]: false },
            pullProgress: { ...state.pullProgress, [model]: 0 },
            pullStreams: { ...state.pullStreams, [model]: null },
          }));
        }
      },

      activateModel: async (model: string | null) => {
        const { activeModel } = get();
        if (model === activeModel) return;

        if (model === null) {
          set({ activeModel: null, activatingModel: null, deactivatingModel: null });
        } else {
          set({ activatingModel: model, deactivatingModel: activeModel });
        }

        try {
          if (activeModel) {
            await ollama.generate({
              model: activeModel,
              prompt: "",
              keep_alive: 0,
            });
          }
          if (model) {
            await ollama.generate({
              model,
              prompt: "",
              keep_alive: "5m",
              options: { num_ctx: 4096 },
            });
          }
          set({
            activeModel: model,
            selectedModel: model,
            activatingModel: null,
            deactivatingModel: null,
          });
        } catch (error) {
          console.error(
            `Error ${model ? "activating" : "deactivating"} model ${model}:`,
            error,
          );
          set({ activatingModel: null, deactivatingModel: null });
        }
      },

      initializeApp: async () => {
        set({ isModelLoading: true });
        const { setSelectedDate } = useChatStore.getState();
        const { resetTimer, setIntervalId, handleModeChange } =
          usePomodoroStore.getState();
        setSelectedDate(new Date());
        resetTimer();
        handleModeChange("work");
        setIntervalId(null);
        try {
          await get().checkOllamaStatus();
          await get().registerGlobalShortcut();
          if (get().isOllamaRunning) {
            await get().fetchInstalledModels();
          }
        } catch (error) {
          console.error("Error initializing app:", error);
        } finally {
          set({ isModelLoading: false });
        }
      },

      checkOllamaStatus: async () => {
        try {
          await ollama.list();
          set({ isOllamaRunning: true });
        } catch (error) {
          set({
            isOllamaRunning: false,
            activatingModel: null,
            deactivatingModel: null,
            installedModels: [],
            pullProgress: {},
            isPulling: {},
            pullStreams: {},
          });
          console.error("Error checking Ollama status:", error);
        }
      },

      startOllama: async () => {
        await invoke("start_ollama");
      },

      registerGlobalShortcut: async () => {
        const currentShortcut = get().globalShortcut;
        try {
          const alreadyRegistered = await isRegistered(currentShortcut);
          if (!alreadyRegistered) {
            await register(currentShortcut, get().showMainWindow);
            console.log("Global shortcut registered:", currentShortcut);
          } else {
            console.log("Shortcut already registered:", currentShortcut);
          }
        } catch (error) {
          console.error("Error registering global shortcut:", error);
        }
      },

      unregisterGlobalShortcut: async () => {
        const currentShortcut = get().globalShortcut;
        try {
          const isCurrentlyRegistered = await isRegistered(currentShortcut);
          if (isCurrentlyRegistered) {
            await unregister(currentShortcut);
            console.log("Global shortcut unregistered:", currentShortcut);
          } else {
            console.log("Shortcut not registered:", currentShortcut);
          }
        } catch (error) {
          console.error("Error unregistering global shortcut:", error);
        }
      },
      checkInInterval: 30 * 60 * 1000,
      setCheckInInterval: (interval: number) =>
        set({ checkInInterval: interval }),
      isShortcutDialogOpen: false,
      setIsShortcutDialogOpen: (isOpen: boolean) => set({ isShortcutDialogOpen: isOpen }),
    }),
    {
      name: "ollama-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useOllamaStore);
