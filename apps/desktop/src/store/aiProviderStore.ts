import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_MODELS, DEFAULT_PROVIDER_CONFIGS } from "@/lib/aiModels";
import type {
  AIProvider,
  ProviderConfig,
  ModelInfo,
  ProviderStatus,
  OpenAIConfig,
  FocuConfig,
} from "@/lib/aiModels";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

interface AIProviderStore {
  providers: Record<AIProvider, ProviderConfig>;
  updateProviderConfig: (
    provider: AIProvider,
    config: Partial<ProviderConfig>,
  ) => void;

  availableModels: ModelInfo[];

  activeProvider: AIProvider | null;
  setActiveProvider: (provider: AIProvider | null) => void;
  activeModel: string | null;
  setActiveModel: (
    modelId: string | null,
  ) => Promise<{ success: boolean; error?: string }>;

  addCustomModel: (model: ModelInfo) => void;
  removeCustomModel: (modelId: string) => void;

  getProviderStatus: (provider: AIProvider) => Promise<ProviderStatus>;
  checkProviderStatus: (provider: AIProvider) => Promise<ProviderStatus>;
}

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set, get) => ({
      providers: DEFAULT_PROVIDER_CONFIGS,
      availableModels: DEFAULT_MODELS,
      activeProvider: null,
      activeModel: null,

      updateProviderConfig: (provider, config) => {
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: {
              ...state.providers[provider],
              ...config,
            },
          },
        }));
      },

      setActiveProvider: (provider) => {
        set({ activeProvider: provider });
      },

      setActiveModel: async (modelId) => {
        if (!modelId) {
          set({ activeModel: null });
          return { success: true };
        }

        const model = get().availableModels.find((m) => m.id === modelId);
        if (!model) {
          return {
            success: false,
            error: "Model not found",
          };
        }

        const provider = get().providers[model.provider];
        if (!provider.enabled) {
          return {
            success: false,
            error: `Please enable and configure ${provider.displayName} first`,
          };
        }

        try {
          const status = await get().checkProviderStatus(model.provider);
          if (!status.isAvailable) {
            return {
              success: false,
              error: status.error || `${provider.displayName} is not available`,
            };
          }

          set({
            activeModel: modelId,
            activeProvider: model.provider,
          });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: "Failed to activate model",
          };
        }
      },

      addCustomModel: (model) => {
        set((state) => ({
          availableModels: [
            ...state.availableModels,
            { ...model, tags: ["Custom"] },
          ],
        }));
      },

      removeCustomModel: (modelId) => {
        set((state) => ({
          availableModels: state.availableModels.filter(
            (m) => m.id !== modelId,
          ),
        }));
      },

      getProviderStatus: async (provider) => {
        const config = get().providers[provider];
        if (!config.enabled) {
          return {
            isAvailable: false,
            error: "Provider not enabled",
          };
        }
        return get().checkProviderStatus(provider);
      },

      checkProviderStatus: async (provider) => {
        const config = get().providers[provider];
        if (!config.enabled) {
          return {
            isAvailable: false,
            error: "Provider not enabled",
          };
        }

        try {
          switch (provider) {
            case "ollama": {
              const ollama = (await import("ollama/browser")).default;
              await ollama.ps();
              return { isAvailable: true };
            }

            case "openai": {
              const openaiConfig = config as OpenAIConfig;
              const hasValidKey =
                openaiConfig.apiKey.startsWith("sk-") &&
                openaiConfig.apiKey.length > 30;
              return {
                isAvailable: hasValidKey,
                error: hasValidKey ? undefined : "Invalid API key",
              };
            }

            case "focu": {
              const focuConfig = config as FocuConfig;
              const hasValidKey = focuConfig.licenseKey.length > 0;
              return {
                isAvailable: hasValidKey,
                error: hasValidKey ? undefined : "Invalid license key",
              };
            }

            default:
              return {
                isAvailable: false,
                error: "Unknown provider",
              };
          }
        } catch (error) {
          return {
            isAvailable: false,
            error: `Error checking ${provider} status: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }
      },
    }),
    {
      name: "ai-provider-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useAIProviderStore);
