import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { useOllamaStore } from "../store";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
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
      // ... other cases for the remaining steps
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl font-bold mb-4">Step {currentStep + 1}</div>
      <div className="text-xl mb-8">{steps[currentStep]}</div>
      <div className="mb-8">{renderStepContent()}</div>
      <div className="flex space-x-4">
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
  );
};

export default OnboardingStepper;
