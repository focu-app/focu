import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { useOllamaStore } from "../store";

const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { setOnboardingCompleted } = useOllamaStore();

  const steps = [
    "Welcome to the app!",
    "Set up your AI model",
    "Configure your preferences",
    "You're all set!",
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingCompleted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl font-bold mb-4">Step {currentStep + 1}</div>
      <div className="text-xl mb-8">{steps[currentStep]}</div>
      <Button onClick={handleNext}>
        {currentStep < steps.length - 1 ? "Next" : "Finish"}
      </Button>
    </div>
  );
};

export default OnboardingStepper;
