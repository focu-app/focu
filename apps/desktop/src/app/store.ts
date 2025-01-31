import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { toast } from "@repo/ui/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { format } from "date-fns";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./store/chatStore";
import { usePomodoroStore } from "./store/pomodoroStore";

export { useChatStore } from "./store/chatStore";

export type SettingsCategory =
  | "General"
  | "AI Models"
  | "Chat"
  | "Pomodoro"
  | "Shortcuts"
  | "Templates"
  | "Check-in"
  | "Homescreen";

interface ModelOption {
  name: string;
  size: string;
  recommended?: boolean;
  parameters?: string;
  description?: string;
  tags?: string[];
}

interface OllamaState {
  selectedModel: string | null;
  installedModels: string[];
  activeModel: string | null;
  pullProgress: { [key: string]: number };
  isPulling: { [key: string]: boolean };
  pullStreams: { [key: string]: AsyncIterable<any> | null };
  fetchInstalledModels: () => Promise<boolean>;
  setSelectedModel: (model: string | null) => void;
  pullModel: (model: string) => Promise<void>;
  stopPull: (model: string) => void;
  activateModel: (model: string | null) => Promise<void>;
  deleteModel: (model: string) => Promise<void>;
  isOllamaRunning: undefined | boolean;
  setIsOllamaRunning: (isRunning: boolean) => void;
  checkOllamaStatus: () => Promise<boolean>;
  startOllama: () => Promise<void>;
  stopOllama: () => Promise<void>;
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
  settingsCategory: SettingsCategory;
  setSettingsCategory: (category: SettingsCategory) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  isShortcutDialogOpen: boolean;
  setIsShortcutDialogOpen: (isOpen: boolean) => void;
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (isOpen: boolean) => void;
  isNewModelDialogOpen: boolean;
  setIsNewModelDialogOpen: (isOpen: boolean) => void;
  modelOptions: ModelOption[];
  addModelOption: (model: ModelOption) => void;
  removeModelOption: (modelName: string) => void;
  closeOnEscape: boolean;
  setCloseOnEscape: (close: boolean) => void;
  checkModelExists: (model: string) => Promise<boolean>;
  isModelAvailable: (model: string) => boolean;
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
}

export const defaultModels: ModelOption[] = [
  {
    name: "llama3.2:latest",
    size: "~2GB",
    recommended: true,
    parameters: "3B",
    description:
      "Created by Meta. Works well on most Mac computers with at least 8GB RAM.",
    tags: ["Featured"],
  },
  {
    name: "qwen2.5:latest",
    size: "~4GB",
    parameters: "7B",
    description: "Created by Alibaba. Requires a Mac with 16GB RAM or more.",
    tags: ["Featured"],
  },
  {
    name: "phi4:latest",
    size: "~9GB",
    parameters: "14B",
    description: "Created by Microsoft. Requires a Mac with 32GB RAM or more.",
    tags: ["Featured"],
  },
];

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
      isOllamaRunning: undefined,
      setIsOllamaRunning: (isRunning: boolean) =>
        set({ isOllamaRunning: isRunning }),
      isModelLoading: false,
      globalShortcut: "Command+Shift+I",
      isSettingsOpen: false,
      setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
      onboardingCompleted: false,
      setOnboardingCompleted: (completed: boolean) =>
        set({ onboardingCompleted: completed }),
      isCommandMenuOpen: false,
      setIsCommandMenuOpen: (isOpen: boolean) =>
        set({ isCommandMenuOpen: isOpen }),
      modelOptions: [
        {
          name: "llama3.2:latest",
          size: "~2GB",
          parameters: "3B",
          recommended: true,
        },
        { name: "qwen2.5:latest", size: "~4GB", parameters: "7B" },
        {
          name: "phi4:latest",
          size: "~9GB",
          parameters: "14B",
        },
      ],
      addModelOption: (model: ModelOption) =>
        set((state) => ({
          modelOptions: [...state.modelOptions, { ...model, tags: ["Custom"] }],
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
            }
          } catch (error) {
            console.error("Error setting global shortcut:", error);
            await get().registerGlobalShortcut();
            throw error;
          }
        }
      },

      getGlobalShortcut: () => get().globalShortcut,

      showMainWindow: async () => {
        const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
        const mainWindow = await WebviewWindow.getByLabel("main");
        if (mainWindow) {
          await mainWindow.show();
          await mainWindow.setFocus();
        }
        await invoke("set_dock_icon_visibility", { visible: true });
      },

      closeMainWindow: async () => {
        const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
        const { invoke } = await import("@tauri-apps/api/core");

        const mainWindow = await WebviewWindow.getByLabel("main");
        if (mainWindow) {
          await mainWindow.hide();
        }
        await invoke("set_dock_icon_visibility", { visible: false });
      },

      fetchInstalledModels: async () => {
        try {
          const models = await ollama.list();
          const installedModelNames = models.models.map((model) => model.name);

          // Update modelOptions to include any installed models that aren't in the list
          set((state) => {
            const existingModelNames = new Set(
              state.modelOptions.map((m) => m.name.toLowerCase()),
            );
            const newModelOptions = [...state.modelOptions];

            for (const modelName of installedModelNames) {
              if (!existingModelNames.has(modelName.toLowerCase())) {
                newModelOptions.push({
                  name: modelName,
                  size: "N/A", // Size is unknown for dynamically discovered models
                });
              }
            }

            return {
              installedModels: installedModelNames,
              modelOptions: newModelOptions,
              isOllamaRunning: true,
            };
          });
          return true;
        } catch (error) {
          set({ isOllamaRunning: false });
          console.error("Error fetching installed models:", error);
          return false;
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

          // After successful pull, update both installedModels and modelOptions
          await get().fetchInstalledModels();

          toast({
            title: "Model downloaded successfully",
            description: `The model ${model} has been downloaded and installed.`,
          });
        } catch (error) {
          console.error(`Error pulling model ${model}:`, error);
          if (error instanceof Error && error.name === "AbortError") return;
          toast({
            title: "Error downloading model",
            description: `Failed to download model ${model}. Please try again.`,
            variant: "destructive",
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
          set({
            activeModel: null,
            activatingModel: null,
            deactivatingModel: null,
          });
        } else {
          set({ activatingModel: model, deactivatingModel: activeModel });
        }

        try {
          if (model) {
            await ollama.generate({
              model,
              prompt: "",
              keep_alive: "5m",
              options: { num_ctx: 4096 },
            });
          } else if (activeModel) {
            await ollama.generate({
              model: activeModel,
              prompt: "",
              keep_alive: 0,
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
        const { setSettingsCategory } = get();
        const { setSelectedDate, contextWindowSize } = useChatStore.getState();
        const { resetTimer, setIntervalId, handleModeChange } =
          usePomodoroStore.getState();
        const dateString = format(new Date(), "yyyy-MM-dd");
        setSelectedDate(dateString);
        resetTimer();
        handleModeChange("work");
        setIntervalId(null);
        setSettingsCategory("General");
        try {
          await get().checkOllamaStatus();
          await get().registerGlobalShortcut();
          await get().fetchInstalledModels();
          const { activeModel } = get();
          if (activeModel) {
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
          set({ isModelLoading: false });
        }
      },

      checkOllamaStatus: async () => {
        try {
          await ollama.ps();

          set({ isOllamaRunning: true });
          return true;
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
          return false;
        }
      },

      startOllama: async () => {
        await invoke("start_ollama");
      },

      stopOllama: async () => {
        await invoke("kill_ollama");
      },

      registerGlobalShortcut: async () => {
        const currentShortcut = get().globalShortcut;
        try {
          const alreadyRegistered = await isRegistered(currentShortcut);
          if (!alreadyRegistered) {
            await register(currentShortcut, get().showMainWindow);
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
          }
        } catch (error) {
          console.error("Error unregistering global shortcut:", error);
        }
      },
      isShortcutDialogOpen: false,
      setIsShortcutDialogOpen: (isOpen: boolean) =>
        set({ isShortcutDialogOpen: isOpen }),
      isNewModelDialogOpen: false,
      setIsNewModelDialogOpen: (isOpen: boolean) =>
        set({ isNewModelDialogOpen: isOpen }),
      closeOnEscape: false,
      setCloseOnEscape: (close: boolean) => set({ closeOnEscape: close }),
      settingsCategory: "General",
      setSettingsCategory: (category: SettingsCategory) =>
        set({ settingsCategory: category }),
      checkModelExists: async (model: string) => {
        try {
          await ollama.show({ model });
          return true;
        } catch (error) {
          if (error instanceof Error && error.message.includes("not found")) {
            return false;
          }
          console.error("Error checking model existence:", error);
          throw error;
        }
      },
      isModelAvailable: (model: string) => {
        const { installedModels } = get();
        return installedModels.includes(model);
      },
      automaticUpdatesEnabled: true,
      setAutomaticUpdatesEnabled: (enabled: boolean) =>
        set({ automaticUpdatesEnabled: enabled }),
      automaticDownloadEnabled: false,
      setAutomaticDownloadEnabled: (enabled: boolean) =>
        set({ automaticDownloadEnabled: enabled }),
      selectedLanguage: "English",
      setSelectedLanguage: (language) => set({ selectedLanguage: language }),
      deleteModel: async (model: string) => {
        try {
          if (get().activeModel === model) {
            await get().activateModel(null);
          }

          await ollama.delete({ model });
          await get().fetchInstalledModels();

          const isDefaultModel = defaultModels
            .map((m) => m.name)
            .includes(model);
          if (!isDefaultModel) {
            set((state) => ({
              modelOptions: state.modelOptions.filter((m) => m.name !== model),
            }));
          }
        } catch (error) {
          console.error(`Error deleting model ${model}:`, error);
          throw error;
        }
      },
      visibleChatTypes: {
        morning: true,
        evening: true,
        "year-end": false,
      },
      setVisibleChatTypes: (types) => set({ visibleChatTypes: types }),
    }),
    {
      name: "ollama-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useOllamaStore);
