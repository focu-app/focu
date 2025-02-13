import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProviderSettings {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  licenseKey?: string;
}

interface AIProviderStore {
  providers: Record<string, ProviderSettings>;
  enabledModels: string[];
  updateProvider: (
    provider: string,
    settings: Partial<ProviderSettings>,
  ) => void;
  toggleModel: (modelId: string) => void;
}

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set) => ({
      providers: {},
      enabledModels: [],

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
    }),
    {
      name: "ai-provider-storage",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted: any, current) => ({
        ...current,
        providers: persisted.providers || {},
        enabledModels: Array.isArray(persisted.enabledModels)
          ? persisted.enabledModels
          : [],
      }),
    },
  ),
);
