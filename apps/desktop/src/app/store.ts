import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import ollama from 'ollama/browser';
import { emit, listen } from '@tauri-apps/api/event';

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
}

// Add a new type for sync events
type SyncEvent = {
  type: 'stateUpdate';
  payload: Partial<OllamaState>;
};

console.log("zustand store", Date.now());

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
      isModelLoading: false, // Initialize the new state

      fetchActiveModel: async () => {
        try {
          const models = await ollama.ps();
          if (models.models.length > 0) {
            set({ selectedModel: models.models[0].name, activeModel: models.models[0].name });
          }
        } catch (error) {
          console.error("Error fetching active model:", error);
        }
      },

      fetchInstalledModels: async () => {
        try {
          const models = await ollama.list();
          set({ installedModels: models.models.map(model => model.name), isOllamaRunning: true });
        } catch (error) {
          set({ isOllamaRunning: false });
          console.error("Error fetching installed models:", error);
        }
      },

      setSelectedModel: (model) => {
        set({ selectedModel: model });
        emit('state-change', { type: 'stateUpdate', payload: { selectedModel: model } });
        localStorage.setItem('ollama-storage', JSON.stringify({ ...get(), selectedModel: model }));
      },

      pullModel: async (model) => {
        set(state => ({
          isPulling: { ...state.isPulling, [model]: true },
          pullProgress: { ...state.pullProgress, [model]: 0 }
        }));

        try {
          const stream = await ollama.pull({ model, stream: true });
          set(state => ({ pullStreams: { ...state.pullStreams, [model]: stream } }));

          for await (const chunk of stream) {
            if ('total' in chunk && 'completed' in chunk) {
              const percentage = Math.round((chunk.completed / chunk.total) * 100);
              set(state => ({ pullProgress: { ...state.pullProgress, [model]: percentage } }));
            }
          }

          await get().fetchInstalledModels();
        } catch (error) {
          console.error(`Error pulling model ${model}:`, error);
        } finally {
          set(state => ({
            isPulling: { ...state.isPulling, [model]: false },
            pullProgress: { ...state.pullProgress, [model]: 0 },
            pullStreams: { ...state.pullStreams, [model]: null }
          }));
        }
      },

      stopPull: (model) => {
        const { pullStreams } = get();
        const stream = pullStreams[model];
        if (stream && 'abort' in stream) {
          (stream as any).abort();
          set(state => ({
            isPulling: { ...state.isPulling, [model]: false },
            pullProgress: { ...state.pullProgress, [model]: 0 },
            pullStreams: { ...state.pullStreams, [model]: null }
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
            await ollama.generate({ model: activeModel, prompt: '', keep_alive: 0 });
          }
          if (model) {
            await ollama.generate({ model, prompt: '', keep_alive: '5m', options: { num_ctx: 4096 } });
            localStorage.setItem('activeModel', model);
          } else {
            localStorage.removeItem('activeModel');
          }
          const newState = {
            activeModel: model,
            selectedModel: model,
            activatingModel: null,
            deactivatingModel: null
          };
          set(newState);
          emit('state-change', {
            type: 'stateUpdate',
            payload: newState
          });
          localStorage.setItem('ollama-storage', JSON.stringify({ ...get(), ...newState }));
        } catch (error) {
          console.error(`Error ${model ? 'activating' : 'deactivating'} model ${model}:`, error);
          set({ activatingModel: null, deactivatingModel: null });
        }
      },

      initializeApp: async () => {
        set({ isModelLoading: true });
        try {
          await get().checkOllamaStatus();
          if (get().isOllamaRunning) {
            await get().fetchInstalledModels();
            const { activeModel } = get();
            if (activeModel) {
              await get().activateModel(activeModel);
            } else {
              await get().fetchActiveModel();
            }
          }

          // Set up listener for state changes from other windows
          listen<SyncEvent>('state-change', (event) => {
            set(event.payload);
          });

          // Set up storage event listener
          window.addEventListener('storage', (event) => {
            if (event.key === 'ollama-storage') {
              const newState = JSON.parse(event.newValue || '{}');
              set(newState);
            }
          });

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
    }),
    {
      name: 'ollama-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        activeModel: state.activeModel,
        installedModels: state.installedModels,
      }),
    }
  )
);