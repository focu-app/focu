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

export function AIProviderSettings() {
  const { providers, updateProvider, enabledModels, toggleModel } =
    useAIProviderStore();
  const { toast } = useToast();

  const handleToggleProvider = (provider: string) => {
    updateProvider(provider, {
      enabled: !providers[provider]?.enabled,
    });
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
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={providers[provider]?.apiKey || ""}
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
                value={providers[provider]?.baseUrl || ""}
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
        return (
          <div className="space-y-2">
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              type="password"
              value={providers[provider]?.licenseKey || ""}
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
                  <div className="text-sm font-medium">{model.displayName}</div>
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
                  onCheckedChange={() => toggleModel(model.id)}
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
      <div className="space-y-4">
        {Object.entries(DEFAULT_PROVIDER_CONFIGS)
          .filter(([key]) => key !== "ollama")
          .map(([key, config]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{config.displayName}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <Switch
                  checked={providers[key]?.enabled || false}
                  onCheckedChange={() => handleToggleProvider(key)}
                />
              </CardHeader>
              <CardContent>
                {(providers[key]?.enabled || false) && (
                  <>
                    {renderProviderConfig(key as AIProvider)}
                    {renderProviderModels(key as AIProvider)}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </SettingsCard>
  );
}
