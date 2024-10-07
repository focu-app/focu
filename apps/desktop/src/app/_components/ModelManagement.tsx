import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { useEffect, useState } from "react";
import { useOllamaStore } from "../store";

export const modelOptions = [
  { name: "ajindal/llama3.1-storm:8b", size: "~4GB" },
  { name: "llama3.2:latest", size: "~2GB" },
  { name: "llama3.1:latest", size: "~4GB" },
];

export const useModelManagement = (selectedModel: string) => {
  const {
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

  const [isInstalling, setIsInstalling] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    fetchInstalledModels();
  }, [fetchInstalledModels]);

  useEffect(() => {
    if (pullProgress[selectedModel] === 100) {
      setIsInstalling(true);
    } else if (!isPulling[selectedModel]) {
      setIsInstalling(false);
    }
  }, [pullProgress, isPulling, selectedModel]);

  const handleModelDownload = () => {
    if (isPulling[selectedModel]) {
      stopPull(selectedModel);
    } else {
      pullModel(selectedModel);
    }
  };

  const handleModelActivation = async () => {
    if (
      installedModels.includes(selectedModel) &&
      selectedModel !== activeModel
    ) {
      setIsActivating(true);
      try {
        await activateModel(selectedModel);
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

export const ModelDownloadButton: React.FC<{ selectedModel: string }> = ({
  selectedModel,
}) => {
  const { isOllamaRunning, isPulling, pullProgress } = useOllamaStore();
  const { isInstalling, handleModelDownload } =
    useModelManagement(selectedModel);

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleModelDownload}
        className="mb-4"
        disabled={!isOllamaRunning || isInstalling}
      >
        {isPulling[selectedModel] ? "Stop Download" : "Download Model"}
      </Button>
      {(isPulling[selectedModel] || isInstalling) && (
        <div className="w-full max-w-xs">
          <Progress value={pullProgress[selectedModel] || 0} className="mb-2" />
          <p className="text-sm text-gray-600">
            {isInstalling
              ? "Installing..."
              : `${Math.round(pullProgress[selectedModel] || 0)}% complete`}
          </p>
        </div>
      )}
    </div>
  );
};
