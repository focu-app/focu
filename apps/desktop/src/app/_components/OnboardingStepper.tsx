import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { useOllamaStore } from "../store";
import { Loader2 } from "lucide-react";

const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { setOnboardingCompleted, checkOllamaStatus, isOllamaRunning } =
    useOllamaStore();
  const [isChecking, setIsChecking] = useState(false);

  const steps = [
    "Welcome to Focu!",
    "Check Ollama Status",
    "Set up your AI model",
    "Configure your preferences",
    "You're all set!",
  ];

  useEffect(() => {
    if (currentStep === 1) {
      checkOllamaStatus();
    }
  }, [currentStep, checkOllamaStatus]);

  const handleNext = () => {
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
                className={`text-lg font-semibold ${isOllamaRunning ? "text-green-600" : "text-red-600"}`}
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
          disabled={currentStep === 1 && !isOllamaRunning}
        >
          {currentStep < steps.length - 1 ? "Next" : "Finish"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStepper;
