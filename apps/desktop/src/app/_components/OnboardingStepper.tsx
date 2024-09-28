import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { useOllamaStore } from "../store";
import { Loader2 } from "lucide-react";
import { Progress } from "@repo/ui/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";

const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState(
    "ajindal/llama3.1-storm:8b",
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const {
    setOnboardingCompleted,
    checkOllamaStatus,
    isOllamaRunning,
    pullModel,
    stopPull,
    isPulling,
    pullProgress,
    installedModels,
    fetchInstalledModels,
    activateModel,
    activeModel,
  } = useOllamaStore();
  const [isChecking, setIsChecking] = useState(false);

  const modelOptions = [
    { name: "ajindal/llama3.1-storm:8b", size: "~4GB" },
    { name: "llama3.2:latest", size: "~3GB" },
    { name: "llama3.1:latest", size: "~4GB" },
  ];

  const steps = [
    "Welcome to Focu!",
    "Check Ollama Status",
    "Download AI Model",
    "You're all set!",
  ];

  useEffect(() => {
    if (currentStep === 1) {
      checkOllamaStatus();
    } else if (currentStep === 2) {
      fetchInstalledModels();
    }
  }, [currentStep, checkOllamaStatus, fetchInstalledModels]);

  useEffect(() => {
    if (pullProgress[selectedModel] === 100) {
      setIsInstalling(true);
    } else if (!isPulling[selectedModel]) {
      setIsInstalling(false);
    }
  }, [pullProgress, isPulling, selectedModel]);

  const handleNext = async () => {
    if (
      currentStep === 2 &&
      installedModels.includes(selectedModel) &&
      selectedModel !== activeModel
    ) {
      setIsActivating(true);
      try {
        await activateModel(selectedModel);
      } catch (error) {
        console.error("Error activating model:", error);
        // Optionally, show an error message to the user
      } finally {
        setIsActivating(false);
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted(true);
    }
  };

  const handleModelDownload = () => {
    if (isPulling[selectedModel]) {
      stopPull(selectedModel);
    } else {
      pullModel(selectedModel);
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
              <div className="flex flex-col items-center">
                <Button
                  onClick={handleModelDownload}
                  className="mb-4"
                  disabled={!isOllamaRunning || isInstalling}
                >
                  {isPulling[selectedModel]
                    ? "Stop Download"
                    : "Download Model"}
                </Button>
                {(isPulling[selectedModel] || isInstalling) && (
                  <div className="w-full max-w-xs">
                    <Progress
                      value={pullProgress[selectedModel] || 0}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      {isInstalling
                        ? "Installing..."
                        : `${Math.round(pullProgress[selectedModel] || 0)}% complete`}
                    </p>
                  </div>
                )}
              </div>
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
                isPulling[selectedModel] ||
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
