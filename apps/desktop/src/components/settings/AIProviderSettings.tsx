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
import { DEFAULT_MODELS, DEFAULT_PROVIDER_CONFIGS } from "@/lib/aiModels";
import type { AIProvider } from "@/lib/aiModels";
import { useToast } from "@repo/ui/hooks/use-toast";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { Separator } from "@repo/ui/components/ui/separator";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { DefaultModelSelector } from "./DefaultModelSelector";
import { invoke } from "@tauri-apps/api/core";

export function AIProviderSettings() {
  const { providers, updateProvider, enabledModels, toggleModel } =
    useAIProviderStore();
  const { toast } = useToast();
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Load API keys on mount
  useEffect(() => {
    const loadKeys = async () => {
      for (const provider of Object.keys(DEFAULT_PROVIDER_CONFIGS)) {
        try {
          const apiKey = await invoke<string | null>("get_api_key", {
            keyName: provider,
          });
          if (apiKey) {
            setApiKeys((prev) => ({
              ...prev,
              [provider]: apiKey,
            }));
          }
        } catch (error) {
          console.error(`Failed to load API key for ${provider}:`, error);
        }
      }
    };
    loadKeys();
  }, []);

  const toggleExpanded = (provider: string) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const handleToggleProvider = (provider: string) => {
    const isDisabling = providers[provider]?.enabled;
    updateProvider(provider, {
      enabled: !isDisabling,
    });
  };

  const handleToggleModel = (modelId: string) => {
    toggleModel(modelId);
  };

  const handleUpdateConfig = (
    provider: string,
    field: string,
    value: string,
  ) => {
    updateProvider(provider, { [field]: value });
  };

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  const renderProviderConfig = (provider: AIProvider) => {
    switch (provider) {
      case "openai": {
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKeys[provider] || ""}
              onChange={(e) =>
                handleUpdateConfig(provider, "apiKey", e.target.value)
              }
              placeholder="sk-..."
            />
          </div>
        );
      }
      case "openrouter": {
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKeys[provider] || ""}
              onChange={(e) =>
                handleUpdateConfig(provider, "apiKey", e.target.value)
              }
              placeholder="sk-or-..."
            />
          </div>
        );
      }
      case "focu": {
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">License Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKeys[provider] || ""}
              onChange={(e) =>
                handleUpdateConfig(provider, "apiKey", e.target.value)
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

  const renderProviderModels = (provider: AIProvider) => {
    const providerModels = DEFAULT_MODELS.filter(
      (m) => m.provider === provider,
    );
    if (providerModels.length === 0) return null;

    return (
      <div className="space-y-4">
        <Separator className="my-4" />
        <div>
          <h3 className="text-sm font-medium mb-2">Available Models</h3>
          <div className="space-y-2">
            {providerModels.map((model) => (
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
    );
  };

  return (
    <SettingsCard title="AI Providers" onSave={handleSave}>
      <div className="space-y-6">
        <DefaultModelSelector />

        <div className="space-y-4">
          {Object.entries(DEFAULT_PROVIDER_CONFIGS).map(([key, config]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent"
                  onClick={() => toggleExpanded(key)}
                >
                  <div className="flex items-center space-x-2">
                    {expandedProviders[key] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="space-y-1 text-left">
                      <CardTitle>{config.displayName}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                </Button>
                <Switch
                  checked={providers[key]?.enabled || false}
                  onCheckedChange={() => handleToggleProvider(key)}
                />
              </CardHeader>
              {expandedProviders[key] && (
                <CardContent>
                  {renderProviderConfig(key as AIProvider)}
                  {providers[key]?.enabled &&
                    renderProviderModels(key as AIProvider)}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}
