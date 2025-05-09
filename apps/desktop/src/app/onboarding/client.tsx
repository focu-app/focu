"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useOllamaStore } from "../../store/ollamaStore";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import {
  ModelDownloadButton,
  useModelManagement,
} from "../../components/models/ModelManagement";
import { useAppStore } from "@/store/appStore";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { DEFAULT_MODELS, DEFAULT_PROVIDER_CONFIGS } from "@/lib/aiModels";
import { Switch } from "@repo/ui/components/ui/switch";

type AISetupType = "local" | "cloud" | undefined;
type CloudProvider = "openai" | "openrouter" | "openai-compatible" | undefined;

export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState("llama3.2:latest");
  const [setupType, setSetupType] = useState<AISetupType>("local");
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [customModel, setCustomModel] = useState({
    id: "",
    displayName: "",
  });

  const { checkOllamaStatus, isOllamaRunning, installedModels, getAllModels } =
    useOllamaStore();
  const {
    setActiveModel,
    toggleModel,
    updateProvider,
    enabledModels,
    activeModel,
    isModelAvailable,
    availableModels,
    syncOllamaModels,
    addModel,
  } = useAIProviderStore();
  const { onboardingCompleted, setOnboardingCompleted } = useAppStore();
  const [isChecking, setIsChecking] = useState(false);
  const { isDownloading, isInstalling } = useModelManagement(selectedModel);

  useEffect(() => {
    async function init() {
      if (onboardingCompleted) return;
      if (setupType === "local") {
        await checkOllamaStatus();
      }
    }
    init();
  }, [onboardingCompleted, checkOllamaStatus, setupType]);

  // Keep Ollama models in sync
  useEffect(() => {
    if (setupType === "local") {
      console.log(
        "Ollama models will be synced automatically when installedModels changes:",
        installedModels,
      );
      // syncOllamaModels will be triggered automatically by the subscription
    }
  }, [setupType, installedModels]);

  const handleNext = async () => {
    console.log("handleNext called, currentStep:", currentStep);
    console.log("Current state:", {
      setupType,
      selectedModel,
      enabledModels,
      activeModel,
      isOllamaRunning,
      installedModels,
    });

    if (currentStep === 0) {
      invoke("start_ollama");
    }

    if (currentStep === 1 && setupType === "local" && !isOllamaRunning) {
      await checkOllamaStatus();
    }

    if (currentStep === 2) {
      if (setupType === "local" && installedModels.includes(selectedModel)) {
        toggleModel(selectedModel);
        setActiveModel(selectedModel);
      } else if (setupType === "cloud" && cloudProvider) {
        // Update provider configuration
        await updateProvider(cloudProvider, {
          apiKey,
          ...(cloudProvider === "openai-compatible" ? { baseUrl } : {}),
        });

        if (cloudProvider !== "openai-compatible") {
          // Enable all models for the selected cloud provider by default
          const providerModels = DEFAULT_MODELS.filter(
            (m) => m.provider === cloudProvider,
          );

          for (const model of providerModels) {
            if (!enabledModels.includes(model.id)) {
              toggleModel(model.id);
            }
          }

          // Find the first available model and set it as active
          const availableEnabledModels = availableModels.filter(
            (model) =>
              model.provider === cloudProvider &&
              enabledModels.includes(model.id) &&
              isModelAvailable(model.id),
          );

          if (availableEnabledModels.length > 0) {
            setActiveModel(availableEnabledModels[0].id);
          }
        }
      }
    }

    if (currentStep === 3) {
      if (setupType === "local" && installedModels.includes(selectedModel)) {
        if (!enabledModels.includes(selectedModel)) {
          toggleModel(selectedModel);
        }
        setActiveModel(selectedModel);
      } else if (
        setupType === "cloud" &&
        cloudProvider === "openai-compatible" &&
        customModel.id
      ) {
        const model = {
          id: customModel.id,
          displayName: customModel.displayName || customModel.id,
          provider: "openai-compatible" as const,
          description: "Custom OpenAI Compatible model",
        };
        addModel(model);
        toggleModel(model.id);
        setActiveModel(model.id);
      }
    }

    setCurrentStep(currentStep + 1);

    if (currentStep === 3) {
      console.log("Completing onboarding");
      setOnboardingCompleted(true);
      invoke("complete_onboarding");
    }
  };

  const handleSkipStep = () => {
    if (currentStep === 2) {
      // Skip both the provider setup and model selection steps
      setCurrentStep(currentStep + 2);
      setOnboardingCompleted(true);
      invoke("complete_onboarding");
      return;
    }

    if (currentStep === 3) {
      if (setupType === "local" || cloudProvider === "openai-compatible") {
        setOnboardingCompleted(true);
        invoke("complete_onboarding");
      }
    }
  };

  const renderSkipButton = () => {
    const isSkippableStep =
      currentStep === 2 || // Ollama or API setup
      (currentStep === 3 && setupType === "local") || // Model download
      (currentStep === 3 && cloudProvider === "openai-compatible"); // OpenAI Compatible model setup

    if (isSkippableStep) {
      return (
        <Button variant="ghost" onClick={handleSkipStep}>
          Skip, I will do it later
        </Button>
      );
    }

    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Welcome to Focu!</h1>
            <p className="mb-4">
              Focu is your AI-powered productivity companion, designed to help
              you stay focused and organized.
            </p>
            <p className="mb-4">Setup only takes a few minutes.</p>
          </div>
        );
      case 1:
        return (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Choose Your AI Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card
                className={`cursor-pointer transition-all ${setupType === "local" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSetupType("local")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Local AI</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                      Free
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Run AI models directly on your computer. More private, but
                    requires downloading models.
                  </p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${setupType === "cloud" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSetupType("cloud")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Cloud AI</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      Free & Paid Options
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use cloud-based AI models. Faster setup, but requires an API
                    key.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 2:
        return setupType === "local" ? (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Local AI Setup</h2>
            <p className="mb-4">
              First, we need to check if Ollama is installed and running on your
              system.
            </p>
            <div className="flex justify-center">
              {isChecking ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Ollama status...
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    setIsChecking(true);
                    await invoke("start_ollama");
                    setTimeout(async () => {
                      await checkOllamaStatus();
                      setIsChecking(false);
                    }, 2500);
                  }}
                >
                  Check Ollama Status
                </Button>
              )}
            </div>
            {isOllamaRunning === false && (
              <div className="mt-4">
                <p className="text-red-500 mb-4">
                  Ollama is not running. Pressing "Check Ollama Status" should
                  be sufficient. If not, follow the steps below to install it
                  first:
                </p>
                <div className="text-left">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      Download Ollama from{" "}
                      <Link
                        href="https://ollama.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        ollama.ai
                      </Link>
                    </li>
                    <li>Install Ollama on your computer</li>
                    <li>Start Ollama</li>
                    <li>Click "Check Ollama Status" again</li>
                  </ol>
                </div>
              </div>
            )}
            {isOllamaRunning === true && (
              <p className="text-green-500 mt-4">
                Ollama is running! Click Next to continue.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Cloud AI Setup</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <RadioGroup
                  value={cloudProvider}
                  onValueChange={(value) =>
                    setCloudProvider(value as CloudProvider)
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="openai" id="openai" />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="openai">OpenAI</Label>
                      <Link
                        href="https://platform.openai.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="openrouter" id="openrouter" />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="openrouter">OpenRouter</Label>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                        Free Options Available
                      </span>
                      <Link
                        href="https://openrouter.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="openai-compatible"
                      id="openai-compatible"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="openai-compatible">
                        OpenAI Compatible
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {cloudProvider && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mt-4">
                    {cloudProvider === "openai" ? (
                      <>
                        Visit{" "}
                        <a
                          href={DEFAULT_PROVIDER_CONFIGS.openai.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {DEFAULT_PROVIDER_CONFIGS.openai.displayName}
                        </a>{" "}
                        to get your API key from the settings.
                      </>
                    ) : cloudProvider === "openrouter" ? (
                      <>
                        Visit{" "}
                        <a
                          href={DEFAULT_PROVIDER_CONFIGS.openrouter.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {DEFAULT_PROVIDER_CONFIGS.openrouter.displayName}
                        </a>{" "}
                        to create an account and get your API key. Free models
                        are available!
                      </>
                    ) : (
                      <>
                        Please refer to your provider's documentation for API
                        key and endpoint configuration.
                      </>
                    )}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">
                      API Key{" "}
                      {cloudProvider === "openai-compatible"
                        ? "(optional)"
                        : null}
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        cloudProvider === "openai"
                          ? "sk-..."
                          : cloudProvider === "openrouter"
                            ? "sk-or-..."
                            : "sk-... (optional)"
                      }
                    />
                  </div>
                  {cloudProvider === "openai-compatible" && (
                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">Base URL</Label>
                      <Input
                        id="baseUrl"
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://api.example.com/v1"
                        required
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return setupType === "local" ? (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Choose a Local Model</h2>
            <p className="mb-4">
              We recommend using the <strong>llama3.2:latest</strong> model by
              default. It's faster and smaller than the other models.
            </p>
            <RadioGroup
              value={selectedModel}
              onValueChange={setSelectedModel}
              className="mb-4"
            >
              {getAllModels().map((model) => (
                <div key={model.name} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.name} id={model.name} />
                  <Label htmlFor={model.name}>
                    {model.name} ({model.size}){" "}
                    {model.recommended && "(recommended, faster and smaller)"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {installedModels.includes(selectedModel) ? (
              <p className="text-green-600 dark:text-green-400 font-semibold mb-4">
                Selected model is installed!
              </p>
            ) : (
              <ModelDownloadButton selectedModel={selectedModel} />
            )}
          </div>
        ) : cloudProvider === "openai-compatible" ? (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Add OpenAI Compatible Model
            </h2>
            <p className="mb-4">
              Configure your model for the OpenAI Compatible API endpoint. You
              can skip this step and add models later in settings.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelId">Model ID</Label>
                <Input
                  id="modelId"
                  type="text"
                  value={customModel.id}
                  onChange={(e) =>
                    setCustomModel((prev) => ({
                      ...prev,
                      id: e.target.value,
                    }))
                  }
                  placeholder="gpt-3.5-turbo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelName">Display Name (optional)</Label>
                <Input
                  id="modelName"
                  type="text"
                  value={customModel.displayName}
                  onChange={(e) =>
                    setCustomModel((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="GPT-3.5 Turbo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Available Cloud Models</h2>
            <p className="mb-4">
              The following models are available through{" "}
              {cloudProvider === "openai" ? (
                <a
                  href={DEFAULT_PROVIDER_CONFIGS.openai.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {DEFAULT_PROVIDER_CONFIGS.openai.displayName}
                </a>
              ) : cloudProvider === "openrouter" ? (
                <a
                  href={DEFAULT_PROVIDER_CONFIGS.openrouter.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {DEFAULT_PROVIDER_CONFIGS.openrouter.displayName}
                </a>
              ) : (
                cloudProvider
              )}
              . All models are enabled by default. You can add more models later
              in settings.
            </p>
            <div className="space-y-2">
              {(cloudProvider === "openai" ||
                cloudProvider === "openrouter") && (
                <p className="text-sm text-muted-foreground mb-4">
                  Learn more about the models at{" "}
                  <a
                    href={
                      cloudProvider === "openai"
                        ? "https://platform.openai.com/docs/models"
                        : "https://openrouter.ai/models"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {cloudProvider === "openai"
                      ? "platform.openai.com/docs/models"
                      : "openrouter.ai/models"}
                  </a>
                </p>
              )}
              {DEFAULT_MODELS.filter((m) => m.provider === cloudProvider).map(
                (model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{model.displayName}</div>
                      {(model.provider === "openrouter" ||
                        model.provider === "openai") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 cursor-pointer"
                          asChild
                        >
                          <a
                            href={
                              model.provider === "openrouter"
                                ? `https://openrouter.ai/${model.id}`
                                : `https://platform.openai.com/docs/models#${model.id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              model.provider === "openrouter"
                                ? "View on OpenRouter"
                                : "View OpenAI Models Documentation"
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {model.tags?.includes("Free") && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                          Free
                        </span>
                      )}
                    </div>
                    <Switch
                      checked={enabledModels.includes(model.id)}
                      onCheckedChange={() => toggleModel(model.id)}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">You're all set!</h1>
            <p className="mb-4">
              You can now start using Focu. Click Finish to continue.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full h-10" data-tauri-drag-region />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-6">{renderStepContent()}</div>
          </ScrollArea>
        </div>
      </div>
      <div className="p-8 border-t">
        <div className="max-w-2xl mx-auto flex justify-between">
          {currentStep !== 0 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          {renderSkipButton()}
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !setupType) ||
              (currentStep === 2 &&
                setupType === "local" &&
                !isOllamaRunning) ||
              (currentStep === 2 &&
                setupType === "cloud" &&
                (!cloudProvider ||
                  (cloudProvider === "openai-compatible" && !baseUrl) ||
                  (cloudProvider !== "openai-compatible" && !apiKey))) ||
              (currentStep === 3 &&
                setupType === "local" &&
                !installedModels.includes(selectedModel) &&
                (isDownloading || isInstalling)) ||
              (currentStep === 3 &&
                setupType === "cloud" &&
                cloudProvider === "openai-compatible" &&
                !customModel.id)
            }
          >
            {currentStep === 4 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
