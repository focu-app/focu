import { create } from 'zustand';
import ollama from 'ollama/browser';

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
  activateModel: (model: string) => Promise<void>;
}

export const useOllamaStore = create<OllamaState>((set, get) => ({
  selectedModel: null,
  installedModels: [],
  activeModel: null,
  pullProgress: {},
  isPulling: {},
  pullStreams: {},

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
      set({ installedModels: models.models.map(model => model.name) });
    } catch (error) {
      console.error("Error fetching installed models:", error);
    }
  },

  setSelectedModel: (model) => set({ selectedModel: model }),

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

  activateModel: async (model) => {
    const { activeModel } = get();
    try {
      if (activeModel) {
        await ollama.generate({ model: activeModel, prompt: '', keep_alive: 0 });
      }
      await ollama.generate({ model, prompt: '', keep_alive: '5m', options: { num_ctx: 4096 } });
      set({ activeModel: model, selectedModel: model });
    } catch (error) {
      console.error(`Error activating model ${model}:`, error);
    }
  },
}));