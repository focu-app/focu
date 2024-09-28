import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { useOllamaStore } from "../store";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  modelOptions,
  useModelManagement,
  ModelDownloadButton,
} from "./ModelManagement";

const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState(
    "ajindal/llama3.1-storm:8b",
  );
  const {
    setOnboardingCompleted,
    checkOllamaStatus,
    isOllamaRunning,
    installedModels,
  } = useOllamaStore();
  const [isChecking, setIsChecking] = useState(false);
  const { isInstalling, isActivating, handleModelActivation } =
    useModelManagement(selectedModel);

  const steps = [
    "Welcome to Focu!",
    "Check Ollama Status",
    "Download AI Model",
    "You're all set!",
  ];

  const handleNext = async () => {
    if (currentStep === 2) {
      await handleModelActivation();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted(true);
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
          <div className="text-center">
            <p className="mb-4">
              We use Ollama to run AI models locally on your device, fully
              offline.
            </p>
            <p className="mb-4">
              Let's check if Ollama is running on your system (it is included in
              Focu by default):
            </p>
            {isChecking ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Checking Ollama status...</span>
              </div>
            ) : (
              <p
                className={`text-lg font-semibold ${
                  isOllamaRunning ? "text-green-600" : "text-red-600"
                }`}
              >
                {isOllamaRunning
                  ? "Ollama is running"
                  : "Ollama is not running"}
              </p>
            )}
            {!isOllamaRunning && (
              <p className="mt-4 text-sm text-gray-600">
                Please start Ollama and click "Check Again" to proceed.
              </p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <p className="mb-4">
              Let's download the AI model you'll be using with Focu.
            </p>
            <p className="mb-4">Choose a model from the options below:</p>
            <RadioGroup
              value={selectedModel}
              onValueChange={setSelectedModel}
              className="mb-4"
            >
              {modelOptions.map((model) => (
                <div key={model.name} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.name} id={model.name} />
                  <Label htmlFor={model.name}>
                    {model.name} ({model.size})
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {installedModels.includes(selectedModel) ? (
              <p className="text-green-600 font-semibold mb-4">
                Selected model is installed!
              </p>
            ) : (
              <ModelDownloadButton selectedModel={selectedModel} />
            )}
            {isActivating && (
              <p className="text-blue-600 font-semibold mt-4">
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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[600px] flex flex-col">
        <div className="p-6 border-b">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-gray-600 mt-2 text-center">
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
        <div className="p-6 border-t flex justify-between">
          {currentStep === 1 && !isOllamaRunning && (
            <Button
              onClick={() => {
                setIsChecking(true);
                checkOllamaStatus().finally(() => setIsChecking(false));
              }}
            >
              Check Again
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !isOllamaRunning) ||
                (currentStep === 2 &&
                  (!installedModels.includes(selectedModel) ||
                    isInstalling ||
                    isActivating))
              }
            >
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepper;
