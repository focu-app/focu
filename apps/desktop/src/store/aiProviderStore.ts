import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateText, streamText, type LanguageModel } from "ai";
import type { CoreMessage } from "ai";
import { createOllama } from "ollama-ai-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { AIProvider, ModelInfo } from "@/lib/aiModels";
import { DEFAULT_MODELS, DEFAULT_PROVIDER_CONFIGS } from "@/lib/aiModels";
import { useOllamaStore } from "./ollamaStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

interface ProviderSettings {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  licenseKey?: string;
  contextLength?: number;
}

interface AIProviderStore {
  providers: Record<string, ProviderSettings>;
  enabledModels: string[];
  activeModel: string | null;
  availableModels: ModelInfo[];

  // Provider management
  updateProvider: (
    provider: string,
    settings: Partial<ProviderSettings>,
  ) => void;
  toggleModel: (modelId: string) => void;
  setActiveModel: (modelId: string | null) => void;
  addModel: (model: ModelInfo) => void;
  removeModel: (modelId: string) => void;
  syncOllamaModels: () => void;

  // Model management
  isModelAvailable: (modelId: string) => boolean;
  getModelProvider: (modelId: string) => AIProvider | undefined;
  getProviderConfig: (provider: AIProvider) => ProviderSettings | undefined;

  // Chat functionality
  streamChat: (
    messages: CoreMessage[],
    modelId: string,
  ) => AsyncIterable<string>;
  generateText: (
    messages: CoreMessage[],
    modelId: string,
  ) => Promise<{ text: string }>;
}

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set, get) => ({
      providers: DEFAULT_PROVIDER_CONFIGS,
      enabledModels: [],
      activeModel: null,
      availableModels: DEFAULT_MODELS,

      updateProvider: (provider, settings) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              ...settings,
            },
          },
        })),

      toggleModel: (modelId) =>
        set((state) => ({
          enabledModels: state.enabledModels.includes(modelId)
            ? state.enabledModels.filter((id) => id !== modelId)
            : [...state.enabledModels, modelId],
        })),

      setActiveModel: (modelId) => set({ activeModel: modelId }),

      addModel: (model) =>
        set((state) => ({
          availableModels: [...state.availableModels, model],
        })),

      removeModel: (modelId) =>
        set((state) => ({
          availableModels: state.availableModels.filter(
            (m) => m.id !== modelId,
          ),
          enabledModels: state.enabledModels.filter((id) => id !== modelId),
          activeModel: state.activeModel === modelId ? null : state.activeModel,
        })),

      syncOllamaModels: () => {
        const ollamaStore = useOllamaStore.getState();
        const { installedModels, modelOptions } = ollamaStore;

        // Convert Ollama models to ModelInfo format
        const ollamaModels: ModelInfo[] = modelOptions
          .filter((model) => installedModels.includes(model.name))
          .map(
            (model) =>
              ({
                id: model.name,
                displayName: model.name,
                provider: "ollama",
                description: model.description || "Local Ollama model",
                tags: model.tags || [],
                contextLength: get().providers.ollama.contextLength || 4096,
                size: model.size,
                parameters: model.parameters || "unknown",
              }) as const,
          );

        // Update availableModels with cloud models and installed Ollama models
        set((state) => ({
          availableModels: [
            ...DEFAULT_MODELS.filter((m) => m.provider !== "ollama"),
            ...ollamaModels,
          ],
        }));
      },

      isModelAvailable: (modelId) => {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) return false;

        const provider = get().providers[model.provider];
        if (!provider?.enabled) return false;

        if (model.provider === "ollama") {
          const ollamaStore = useOllamaStore.getState();
          return Boolean(ollamaStore.installedModels.includes(modelId));
        }

        return true;
      },

      getModelProvider: (modelId) => {
        const model = get().availableModels.find((m) => m.id === modelId);
        return model?.provider;
      },

      getProviderConfig: (provider) => {
        return get().providers[provider];
      },

      streamChat: async function* (messages: CoreMessage[], modelId: string) {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) throw new Error(`Model ${modelId} not found`);

        const provider = get().providers[model.provider];
        if (!provider?.enabled)
          throw new Error(`Provider ${model.provider} not enabled`);

        let aiModel: LanguageModel;
        switch (model.provider) {
          case "ollama":
            aiModel = createOllama()(modelId, {
              numCtx: provider.contextLength || 4096,
            });
            break;
          case "openai":
            if (!provider.apiKey)
              throw new Error("OpenAI API key not configured");
            aiModel = createOpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            })(modelId);
            break;
          case "openrouter":
            if (!provider.apiKey)
              throw new Error("OpenRouter API key not configured");
            aiModel = createOpenRouter({
              apiKey: provider.apiKey,
            })(modelId);
            break;
          default:
            throw new Error(`Provider ${model.provider} not implemented`);
        }

        const stream = streamText({ model: aiModel, messages });
        for await (const chunk of stream.textStream) {
          yield chunk;
        }
      },

      generateText: async (messages: CoreMessage[], modelId: string) => {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) throw new Error(`Model ${modelId} not found`);

        const provider = get().providers[model.provider];
        if (!provider?.enabled)
          throw new Error(`Provider ${model.provider} not enabled`);

        let aiModel: LanguageModel;
        switch (model.provider) {
          case "ollama":
            aiModel = createOllama()(modelId, {
              numCtx: provider.contextLength || 4096,
            });
            break;
          case "openai":
            if (!provider.apiKey)
              throw new Error("OpenAI API key not configured");
            aiModel = createOpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            })(modelId);
            break;
          case "openrouter":
            if (!provider.apiKey)
              throw new Error("OpenRouter API key not configured");
            aiModel = createOpenRouter({
              apiKey: provider.apiKey,
            })(modelId);
            break;
          default:
            throw new Error(`Provider ${model.provider} not implemented`);
        }

        return generateText({ model: aiModel, messages });
      },
    }),
    {
      name: "ai-provider-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useAIProviderStore);
