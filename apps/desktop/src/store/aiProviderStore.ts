import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateText, streamText, type LanguageModel } from "ai";
import type { CoreMessage } from "ai";
import { createOllama } from "ollama-ai-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { AIProvider, ModelInfo, BaseProviderConfig } from "@/lib/aiModels";
import { DEFAULT_MODELS, DEFAULT_PROVIDER_CONFIGS } from "@/lib/aiModels";
import { useOllamaStore } from "./ollamaStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { invoke } from "@tauri-apps/api/core";

interface RuntimeProviderSettings extends BaseProviderConfig {
  contextLength?: number;
  baseUrl?: string;
  apiKey?: string;
}

interface AIProviderStore {
  providers: Record<string, RuntimeProviderSettings>;
  enabledModels: string[];
  activeModel: string | null;
  availableModels: ModelInfo[];

  // Provider management
  updateProvider: (
    provider: string,
    settings: Partial<RuntimeProviderSettings>,
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
  ) => Promise<RuntimeProviderSettings & { apiKey?: string }>;

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
            await invoke("store_api_key", {
              keyName: provider,
              apiKey: apiKey.trim(),
            });
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
              enabled:
                provider === "ollama"
                  ? state.providers[provider]?.enabled
                  : !!apiKey,
              ...otherSettings,
            },
          },
        }));
      },

      toggleModel: (modelId) =>
        set((state) => {
          const isEnabled = state.enabledModels.includes(modelId);
          const newEnabledModels = isEnabled
            ? state.enabledModels.filter((id) => id !== modelId)
            : [...state.enabledModels, modelId];

          // If we're disabling the current default model, find a new default
          let newActiveModel = state.activeModel;
          if (isEnabled && modelId === state.activeModel) {
            const remainingEnabledModels = newEnabledModels
              .map((id) => state.availableModels.find((m) => m.id === id))
              .filter(Boolean) as ModelInfo[];

            if (remainingEnabledModels.length > 0) {
              newActiveModel = remainingEnabledModels[0].id;
            } else {
              newActiveModel = null;
            }
          }

          return {
            enabledModels: newEnabledModels,
            activeModel: newActiveModel,
          };
        }),

      setActiveModel: (modelId) => set({ activeModel: modelId }),

      addModel: (model) =>
        set((state) => ({
          availableModels: [...state.availableModels, model],
        })),

      removeModel: (modelId) =>
        set((state) => {
          // Don't remove default models
          const isDefaultModel = DEFAULT_MODELS.some((m) => m.id === modelId);

          // For Ollama models, check if they're in the default Ollama models list
          const model = state.availableModels.find((m) => m.id === modelId);
          const isOllamaModel = model?.provider === "ollama";

          if (isDefaultModel || (isOllamaModel && !modelId.includes(":"))) {
            return state;
          }

          return {
            availableModels: state.availableModels.filter(
              (m) => m.id !== modelId,
            ),
            enabledModels: state.enabledModels.filter((id) => id !== modelId),
            activeModel:
              state.activeModel === modelId ? null : state.activeModel,
          };
        }),

      syncOllamaModels: () => {
        const ollamaStore = useOllamaStore.getState();
        const { installedModels, isOllamaRunning, getAllModels } = ollamaStore;

        const ollamaModels: ModelInfo[] = getAllModels()
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
          const nonOllamaModels = state.availableModels.filter(
            (m) => m.provider !== "ollama",
          );

          const providers = {
            ...state.providers,
            ollama: {
              ...state.providers.ollama,
              enabled: !!isOllamaRunning,
            },
          };

          return {
            providers,
            availableModels: [...nonOllamaModels, ...ollamaModels],
          };
        });
      },

      isModelAvailable: (modelId: string): boolean => {
        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) return false;

        if (model.provider === "ollama") {
          const { installedModels, isOllamaRunning } =
            useOllamaStore.getState();
          return (
            Boolean(installedModels.includes(modelId)) && !!isOllamaRunning
          );
        }

        // For cloud providers, check if the provider exists
        const provider = get().providers[model.provider];

        return !!provider;
      },

      getModelProvider: (modelId: string) => {
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

        const stream = streamText({
          model: aiModel,
          messages,
          onError: (error) => {
            console.error("Stream error:", error);
            throw error.error;
          },
        });
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
