"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Progress } from "@repo/ui/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { defaultModels, useOllamaStore } from "../store";

import { invoke } from "@tauri-apps/api/core";
import Link from "next/link";
import {
  ModelDownloadButton,
  useModelManagement,
} from "../_components/ModelManagement";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState("llama3.2:latest");
  const {
    onboardingCompleted,
    setOnboardingCompleted,
    checkOllamaStatus,
    isOllamaRunning,
    installedModels,
  } = useOllamaStore();
  const [isChecking, setIsChecking] = useState(false);
  const { isDownloading, isInstalling, isActivating, handleModelActivation } =
    useModelManagement(selectedModel);

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
      await handleModelActivation();
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
          <div className="text-center">
            <p className="mb-4">
              Welcome to Focu, your AI-powered productivity assistant!
            </p>
            <p>Let's get you set up and ready to go.</p>
          </div>
        );
      case 1:
        return (
          <div className="text-center max-w-xl mx-auto">
            <p className="mb-4 max-w-xl mx-auto">
              Focu uses Ollama to run AI models locally on your device. That
              means after the initial setup, there's no internet connection
              required and your data will never be sent to anyone.
            </p>
            <p className="mb-4">
              Ollama is open-source and has millions of downloads.{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Learn more
              </a>
            </p>
            {isChecking ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Checking Ollama status...</span>
              </div>
            ) : (
              <p
                className={`text-lg font-semibold ${
                  isOllamaRunning
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isOllamaRunning
                  ? "Ollama is running"
                  : "Ollama is not running"}
              </p>
            )}
            {!isOllamaRunning && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                No worries, you can skip this step and do it later.
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
            {isActivating && (
              <p className="text-blue-600 dark:text-blue-400 font-semibold mt-4">
                Activating model...
              </p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <p className="mb-4">Congratulations! You're all set up.</p>
            <p>Click "Finish" to start using Focu.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const allowSkip =
    (currentStep === 1 && !isOllamaRunning) ||
    (currentStep === 2 && !installedModels.includes(selectedModel));

  return (
    <div className="flex items-center justify-center h-screen bg-background/50">
      <div className="rounded-lg shadow-lg h-full w-full flex flex-col">
        <div className="p-6 border-b">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <div className="flex-grow flex flex-col p-6 overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {steps[currentStep]}
          </h2>
          <ScrollArea className="flex-grow">
            <div className="space-y-4">{renderStepContent()}</div>
          </ScrollArea>
        </div>
        <div className="p-6 border-t flex justify-end">
          {allowSkip && (
            <Button
              variant="ghost"
              onClick={handleNext}
              className="text-gray-500"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !isOllamaRunning) ||
              isInstalling ||
              isActivating ||
              isDownloading
            }
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
