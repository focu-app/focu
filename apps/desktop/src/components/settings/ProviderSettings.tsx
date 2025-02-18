import { useAIProviderStore } from "@/store/aiProviderStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { invoke } from "@tauri-apps/api/core";
import type {
  AIProvider,
  OpenAICompatibleConfig,
  OpenAIConfig,
} from "@/lib/aiModels";
import { ApiKeyInput } from "./ApiKeyInput";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { DefaultModelSelector } from "./DefaultModelSelector";
import { ModelList } from "../models/ModelList";

interface ProviderSettingsProps {
  provider: AIProvider;
  title: string;
  keyPlaceholder: string;
  showBaseUrl?: boolean;
}

export function ProviderSettings({
  provider,
  title,
  keyPlaceholder,
  showBaseUrl,
}: ProviderSettingsProps) {
  const { updateProvider } = useAIProviderStore();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const key = await invoke<string | null>("get_api_key", {
          keyName: provider,
        });
        if (key) {
          setApiKey(key);
        }
        const config = await useAIProviderStore
          .getState()
          .getProviderConfig(provider);
        if ("baseUrl" in config && typeof config.baseUrl === "string") {
          setBaseUrl(config.baseUrl);
        }
      } catch (error) {
        console.error(`Failed to load ${provider} settings:`, error);
      }
    };
    loadSettings();
  }, [provider]);

  const handleUpdateConfig = async (key: string, value: string) => {
    if (key === "apiKey") {
      setApiKey(value);
      await updateProvider(provider, { apiKey: value });
    } else if (
      key === "baseUrl" &&
      (provider === "openai-compatible" || provider === "openai")
    ) {
      setBaseUrl(value);
      await updateProvider(provider, { baseUrl: value } as Partial<
        OpenAICompatibleConfig | OpenAIConfig
      >);
    }
  };

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title={title} onSave={handleSave}>
      <div className="space-y-6">
        <ApiKeyInput
          value={apiKey}
          onChange={(value) => handleUpdateConfig("apiKey", value)}
          placeholder={keyPlaceholder}
        />

        {showBaseUrl && (
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => handleUpdateConfig("baseUrl", e.target.value)}
              placeholder="https://your-api-endpoint/v1"
            />
          </div>
        )}

        <DefaultModelSelector />
        <ModelList provider={provider} />
      </div>
    </SettingsCard>
  );
}
