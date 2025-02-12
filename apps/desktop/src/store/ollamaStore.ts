import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { toast } from "@repo/ui/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import ollama from "ollama/browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAppStore } from "./appStore";

export { useChatStore } from "./chatStore";

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
  globalShortcut: string;
  setGlobalShortcut: (shortcut: string) => Promise<void>;
  registerGlobalShortcut: () => Promise<void>;
  unregisterGlobalShortcut: () => Promise<void>;
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
  checkModelExists: (model: string) => Promise<boolean>;
  isModelAvailable: (model: string) => boolean;
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
      globalShortcut: "Command+Shift+I",
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
              const { showMainWindow } = useAppStore.getState();
              await register(shortcut, showMainWindow);
              set({ globalShortcut: shortcut });
            }
          } catch (error) {
            console.error("Error setting global shortcut:", error);
            await get().registerGlobalShortcut();
            throw error;
          }
        }
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
            const { showMainWindow } = useAppStore.getState();
            await register(currentShortcut, showMainWindow);
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
    }),
    {
      name: "ollama-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useOllamaStore);
