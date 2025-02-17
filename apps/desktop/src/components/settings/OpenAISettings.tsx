import { useAIProviderStore } from "@/store/aiProviderStore";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_MODELS } from "@/lib/aiModels";

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
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => handleUpdateConfig(e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Models</h3>
          <div className="space-y-4">
            {openaiModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between py-2"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    {model.displayName}
                  </div>
                  {model.description && (
                    <div className="text-xs text-muted-foreground">
                      {model.description}
                    </div>
                  )}
                  {model.contextLength && (
                    <div className="text-xs text-muted-foreground">
                      Context: {model.contextLength.toLocaleString()} tokens
                    </div>
                  )}
                </div>
                <Switch
                  checked={enabledModels.includes(model.id)}
                  onCheckedChange={() => handleToggleModel(model.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
