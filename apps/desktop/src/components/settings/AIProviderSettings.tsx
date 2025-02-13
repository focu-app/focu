import { useAIProviderStore } from "@/store/aiProviderStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import type { AIProvider, OpenAIConfig, FocuConfig } from "@/lib/aiModels";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";

export function AIProviderSettings() {
  const { providers, updateProviderConfig } = useAIProviderStore();
  const { toast } = useToast();
  const [localProviders, setLocalProviders] = useState(providers);

  const handleToggleProvider = (provider: AIProvider) => {
    setLocalProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        enabled: !prev[provider].enabled,
      },
    }));
  };

  const handleUpdateConfig = (
    provider: AIProvider,
    field: string,
    value: string,
  ) => {
    setLocalProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    for (const [key, config] of Object.entries(localProviders)) {
      updateProviderConfig(key as AIProvider, config);
    }
    showSettingsSavedToast(toast);
  };

  const renderProviderConfig = (provider: AIProvider) => {
    const config = localProviders[provider];
    if (!config) return null;

    switch (provider) {
      case "openai": {
        const openaiConfig = config as OpenAIConfig;
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={openaiConfig.apiKey}
                onChange={(e) =>
                  handleUpdateConfig(provider, "apiKey", e.target.value)
                }
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={openaiConfig.baseUrl}
                onChange={(e) =>
                  handleUpdateConfig(provider, "baseUrl", e.target.value)
                }
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </>
        );
      }
      case "focu": {
        const focuConfig = config as FocuConfig;
        return (
          <div className="space-y-2">
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              type="password"
              value={focuConfig.licenseKey}
              onChange={(e) =>
                handleUpdateConfig(provider, "licenseKey", e.target.value)
              }
              placeholder="Enter your Focu license key"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SettingsCard title="AI Providers" onSave={handleSave}>
      <div className="space-y-4">
        {Object.entries(localProviders)
          .filter(([key]) => key !== "ollama")
          .map(([key, config]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{config.displayName}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() =>
                    handleToggleProvider(key as AIProvider)
                  }
                />
              </CardHeader>
              <CardContent>
                {config.enabled && renderProviderConfig(key as AIProvider)}
              </CardContent>
            </Card>
          ))}
      </div>
    </SettingsCard>
  );
}
