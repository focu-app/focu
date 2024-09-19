import ollama from "ollama/browser";
import { persistNSync } from "persist-and-sync";
import { create } from "zustand";
import { register, unregister, isRegistered } from "@tauri-apps/api/globalShortcut";
import { invoke } from "@tauri-apps/api/tauri";
import { shallow } from 'zustand/shallow';

interface OllamaState {
  selectedModel: string | null;
  installedModels: string[];
  activeModel: string | null;
  pullProgress: { [key: string]: number };
  isPulling: { [key: string]: boolean };
  pullStreams: { [key: string]: AsyncIterable<any> | null };
  fetchActiveModel: () => Promise<void>;
  fetchInstalledModels: () => Promise<void>;
  setSelectedModel: (model: string | null) => void;
  pullModel: (model: string) => Promise<void>;
  stopPull: (model: string) => void;
  activateModel: (model: string | null) => Promise<void>;
  isOllamaRunning: boolean;
  checkOllamaStatus: () => Promise<void>;
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
}

export const useOllamaStore = create<OllamaState>(
  persistNSync(
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
      isModelLoading: false, // Initialize the new state
      globalShortcut: "CommandOrControl+Shift+I",

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

      fetchActiveModel: async () => {
        try {
          const models = await ollama.ps();
          if (models.models.length > 0) {
            set({
              selectedModel: models.models[0].name,
              activeModel: models.models[0].name,
            });
          }
        } catch (error) {
          console.error("Error fetching active model:", error);
        }
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
        } catch (error) {
          console.error(`Error pulling model ${model}:`, error);
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
          set({ deactivatingModel: activeModel, activatingModel: null });
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
            localStorage.setItem("activeModel", model);
          } else {
            localStorage.removeItem("activeModel");
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
        try {
          await get().checkOllamaStatus();
          await get().registerGlobalShortcut();
          if (get().isOllamaRunning) {
            await get().fetchInstalledModels();
            const storedModel = localStorage.getItem("activeModel");
            if (storedModel) {
              await get().activateModel(storedModel);
            } else {
              await get().fetchActiveModel();
            }
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
            activeModel: null,
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
    }),
    {
      name: "ollama-storage",
    },
  ),
);

// Create a custom hook that uses shallow comparison
export const useOllamaStoreShallow = () => useOllamaStore(
  (state) => ({
    activeModel: state.activeModel,
    isModelLoading: state.isModelLoading,
    initializeApp: state.initializeApp,
    registerGlobalShortcut: state.registerGlobalShortcut,
    unregisterGlobalShortcut: state.unregisterGlobalShortcut,
  }),
  shallow
);
