import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { useEffect, useState } from "react";
import { useOllamaStore } from "../store";

export const modelOptions = [
  { name: "ajindal/llama3.1-storm:8b", size: "~4GB" },
  { name: "llama3.2:latest", size: "~2GB" },
  { name: "llama3.1:latest", size: "~4GB" },
];

export const useModelManagement = (model: string) => {
  const {
    isOllamaRunning,
    pullModel,
    stopPull,
    isPulling,
    pullProgress,
    installedModels,
    fetchInstalledModels,
    activateModel,
    selectedModel,
  } = useOllamaStore();

  const [isInstalling, setIsInstalling] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    fetchInstalledModels();
  }, [fetchInstalledModels]);

  useEffect(() => {
    if (pullProgress[model] === 100) {
      setIsInstalling(true);
    } else if (!isPulling[model]) {
      setIsInstalling(false);
    }
  }, [pullProgress, isPulling, model]);

  const handleModelDownload = () => {
    if (isPulling[model]) {
      stopPull(model);
    } else {
      pullModel(model);
    }
  };

  const handleModelActivation = async () => {
    if (installedModels.includes(model) && model !== selectedModel) {
      setIsActivating(true);
      try {
        await activateModel(model);
      } catch (error) {
        console.error("Error activating model:", error);
      } finally {
        setIsActivating(false);
      }
    }
  };

  return {
    isInstalling,
    isActivating,
    handleModelDownload,
    handleModelActivation,
  };
};

export const ModelDownloadButton: React.FC<{ model: string }> = ({ model }) => {
  const { isOllamaRunning, isPulling, pullProgress } = useOllamaStore();
  const { isInstalling, handleModelDownload } = useModelManagement(model);

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleModelDownload}
        className="mb-4"
        disabled={!isOllamaRunning || isInstalling}
      >
        {isPulling[model] ? "Stop Download" : "Download Model"}
      </Button>
      {(isPulling[model] || isInstalling) && (
        <div className="w-full max-w-xs">
          <Progress value={pullProgress[model] || 0} className="mb-2" />
          <p className="text-sm text-gray-600">
            {isInstalling
              ? "Installing..."
              : `${Math.round(pullProgress[model] || 0)}% complete`}
          </p>
        </div>
      )}
    </div>
  );
};
