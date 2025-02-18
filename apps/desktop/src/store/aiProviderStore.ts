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
import { invoke } from "@tauri-apps/api/core";

interface ProviderSettings {
  contextLength?: number;
  baseUrl?: string;
}

interface AIProviderStore {
  providers: Record<string, ProviderSettings>;
  enabledModels: string[];
  activeModel: string | null;
  availableModels: ModelInfo[];

  // Provider management
  updateProvider: (
    provider: string,
    settings: Partial<ProviderSettings> & { apiKey?: string },
  ) => Promise<void>;
  toggleModel: (modelId: string) => void;
  setActiveModel: (modelId: string | null) => void;
  addModel: (model: ModelInfo) => void;
  removeModel: (modelId: string) => void;
  syncOllamaModels: () => void;

  // Model management
  isModelAvailable: (modelId: string) => boolean;
  getModelProvider: (modelId: string) => AIProvider | undefined;
  getProviderConfig: (
    provider: AIProvider,
  ) => Promise<ProviderSettings & { apiKey?: string }>;

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

      updateProvider: async (provider, settings) => {
        const { apiKey, ...otherSettings } = settings;

        // Store API key securely if provided
        if (apiKey !== undefined) {
          if (apiKey) {
            await invoke("store_api_key", { keyName: provider, apiKey });
          } else {
            await invoke("delete_api_key", { keyName: provider });
          }
        }

        // Update other non-sensitive settings in store
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              enabled: !!apiKey,
              ...otherSettings,
            },
          },
        }));
      },

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
            (m) =>
              m.id !== modelId && !DEFAULT_MODELS.some((d) => d.id === m.id),
          ),
          enabledModels: state.enabledModels.filter((id) => id !== modelId),
          activeModel: state.activeModel === modelId ? null : state.activeModel,
        })),

      syncOllamaModels: () => {
        const ollamaStore = useOllamaStore.getState();
        const { installedModels, modelOptions } = ollamaStore;

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
                contextLength: get().providers.ollama?.contextLength || 4096,
                size: model.size,
                parameters: model.parameters || "unknown",
              }) as const,
          );

        set((state) => {
          // Get all non-Ollama models (both default and custom)
          const nonOllamaModels = state.availableModels.filter(
            (m) => m.provider !== "ollama",
          );

          // Get custom models (models that aren't in DEFAULT_MODELS)
          const customModels = nonOllamaModels.filter(
            (m) => !DEFAULT_MODELS.some((d) => d.id === m.id),
          );

          // Combine default models (non-Ollama), custom models, and Ollama models
          return {
            availableModels: [
              ...DEFAULT_MODELS.filter((m) => m.provider !== "ollama"),
              ...customModels,
              ...ollamaModels,
            ],
          };
        });
      },

      isModelAvailable: (modelId) => {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) return false;

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

      getProviderConfig: async (provider) => {
        const config = get().providers[provider];
        const apiKey = await invoke<string | null>("get_api_key", {
          keyName: provider,
        });
        return {
          ...config,
          apiKey: apiKey || undefined,
        };
      },

      streamChat: async function* (messages: CoreMessage[], modelId: string) {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) throw new Error(`Model ${modelId} not found`);

        const provider = await get().getProviderConfig(model.provider);

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
            })(modelId);
            break;
          case "openai-compatible":
            if (!provider.baseUrl)
              throw new Error("OpenAI Compatible base URL not configured");
            aiModel = createOpenAI({
              apiKey: provider.apiKey || "not-needed",
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

        const provider = await get().getProviderConfig(model.provider);

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
            })(modelId);
            break;
          case "openai-compatible":
            if (!provider.baseUrl)
              throw new Error("OpenAI Compatible base URL not configured");
            aiModel = createOpenAI({
              apiKey: provider.apiKey || "not-needed",
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
      partialize: (state) => ({
        providers: Object.fromEntries(
          Object.entries(state.providers).map(([key, value]) => [
            key,
            {
              ...value,
              // Don't persist sensitive data to localStorage
              apiKey: undefined,
              licenseKey: undefined,
            },
          ]),
        ),
        enabledModels: state.enabledModels,
        activeModel: state.activeModel,
        availableModels: state.availableModels,
      }),
    },
  ),
);

withStorageDOMEvents(useAIProviderStore);
