import { useAIProviderStore } from "@/store/aiProviderStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_MODELS } from "@/lib/aiModels";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelCard } from "./ModelCard";

export function OpenAISettings() {
  const { providers, updateProvider, enabledModels, toggleModel } =
    useAIProviderStore();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");

  // Load API key on mount
  useEffect(() => {
    const loadKey = async () => {
      try {
        const key = await invoke<string | null>("get_api_key", {
          keyName: "openai",
        });
        if (key) {
          setApiKey(key);
        }
      } catch (error) {
        console.error("Failed to load OpenAI API key:", error);
      }
    };
    loadKey();
  }, []);

  const handleUpdateConfig = async (value: string) => {
    setApiKey(value);
    await updateProvider("openai", { apiKey: value });
  };

  const handleToggleModel = (modelId: string) => {
    toggleModel(modelId);
  };

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  const openaiModels = DEFAULT_MODELS.filter((m) => m.provider === "openai");

  return (
    <SettingsCard title="OpenAI Settings" onSave={handleSave}>
      <div className="space-y-6">
        <ApiKeyInput
          value={apiKey}
          onChange={handleUpdateConfig}
          placeholder="sk-..."
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Models</h3>
          <div className="space-y-4">
            {openaiModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                enabled={enabledModels.includes(model.id)}
                onToggle={handleToggleModel}
              />
            ))}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
