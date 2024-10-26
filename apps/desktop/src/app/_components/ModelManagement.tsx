import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { useEffect, useState } from "react";
import { useOllamaStore } from "../store";
import { Download, StopCircle } from "lucide-react";

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
    modelOptions,
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
    isDownloading: isPulling[selectedModel] || isInstalling,
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
      {!isPulling[selectedModel] && !isInstalling && (
        <Button
          onClick={handleModelDownload}
          className="mb-4 gap-2"
          disabled={!isOllamaRunning || isInstalling}
          variant="default"
        >
          <Download className="h-4 w-4" />
          Download Model
        </Button>
      )}
      {(isPulling[selectedModel] || isInstalling) && (
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Progress
              value={pullProgress[selectedModel] || 0}
              className="flex-grow"
            />
            {!isInstalling && (
              <Button
                onClick={handleModelDownload}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                title="Stop Download"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isInstalling
              ? "Installing..."
              : `${Math.round(pullProgress[selectedModel] || 0)}% complete`}
          </p>
        </div>
      )}
    </div>
  );
};
