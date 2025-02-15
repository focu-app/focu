"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Progress } from "@repo/ui/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultModels, useOllamaStore } from "../../store/ollamaStore";
import { useAIProviderStore } from "@/store/aiProviderStore";

import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import {
  ModelDownloadButton,
  useModelManagement,
} from "../../components/models/ModelManagement";
import { useAppStore } from "@/store/appStore";

export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState("llama3.2:latest");
  const { checkOllamaStatus, isOllamaRunning, installedModels } =
    useOllamaStore();
  const { setActiveModel, toggleModel } = useAIProviderStore();
  const { onboardingCompleted, setOnboardingCompleted } = useAppStore();
  const [isChecking, setIsChecking] = useState(false);
  const { isDownloading, isInstalling } = useModelManagement(selectedModel);

  useEffect(() => {
    async function init() {
      if (onboardingCompleted) {
        return;
      }
      await checkOllamaStatus();
    }
    init();
  }, [onboardingCompleted, checkOllamaStatus]);

  const steps = [
    "Welcome to Focu!",
    "Ollama Setup",
    "Download AI Model",
    "You're all set!",
  ];

  const handleNext = async () => {
    if (currentStep === 1 && !isOllamaRunning) {
      await checkOllamaStatus();
    }

    if (currentStep === 2 && installedModels.includes(selectedModel)) {
      toggleModel(selectedModel);
      setActiveModel(selectedModel);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted(true);
      invoke("complete_onboarding");
    }
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
            <p className="mb-4">
              Let's get you set up with a local AI model that runs directly on
              your computer.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="text-center max-w-xl mx-auto">
            <p className="mb-4">
              First, we need to check if Ollama is installed and running on your
              system.
            </p>
            <p className="mb-4">
              Ollama is a tool that allows you to run AI models locally on your
              computer.
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
                    await checkOllamaStatus();
                    setIsChecking(false);
                  }}
                >
                  Check Ollama Status
                </Button>
              )}
            </div>
            {isOllamaRunning === false && (
              <div className="mt-4">
                <p className="text-red-500 mb-4">
                  Ollama is not running. Please install it first:
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
        );
      case 2:
        return (
          <div className="text-center max-w-xl mx-auto">
            <p className="mb-4">
              We recommend using the <strong>llama3.2:latest</strong> model by
              default. It's faster and smaller than the other models. More
              advanced users with faster Macs can try other models.{" "}
              <Link
                href="https://ollama.ai/models"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Learn more
              </Link>
            </p>
            <p className="mb-4">You can also skip this step and do it later.</p>
            <RadioGroup
              value={selectedModel}
              onValueChange={setSelectedModel}
              className="mb-4"
            >
              {defaultModels.map((model) => (
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
        );
      case 3:
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
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-sm ${
                    index === currentStep
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <Progress
              value={((currentStep + 1) / steps.length) * 100}
              className="h-2"
            />
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-6">{renderStepContent()}</div>
          </ScrollArea>
        </div>
      </div>
      <div className="p-8 border-t">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !isOllamaRunning) ||
              (currentStep === 2 &&
                !installedModels.includes(selectedModel) &&
                (isDownloading || isInstalling))
            }
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
