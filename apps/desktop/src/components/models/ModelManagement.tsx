import { Button } from "@repo/ui/components/ui/button";
import { Download, StopCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useOllamaStore } from "../../store/ollamaStore";

export const useModelManagement = (selectedModel: string) => {
  const {
    isOllamaRunning,
    pullModel,
    stopPull,
    isPulling,
    pullProgress,
    installedModels,
    fetchInstalledModels,
  } = useOllamaStore();

  const [isInstalling, setIsInstalling] = useState(false);

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

  return {
    isDownloading: isPulling[selectedModel] || isInstalling,
    isInstalling,
    handleModelDownload,
  };
};

export const ModelDownloadButton: React.FC<{ selectedModel: string }> = ({
  selectedModel,
}) => {
  const { isOllamaRunning, isPulling, pullProgress } = useOllamaStore();
  const { isInstalling, handleModelDownload } =
    useModelManagement(selectedModel);

  return (
    <Button
      onClick={handleModelDownload}
      className="w-[200px]"
      disabled={!isOllamaRunning || isInstalling}
      variant="default"
    >
      <div className="flex items-center justify-center gap-2">
        {isPulling[selectedModel] ? (
          <StopCircle className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>
          {isInstalling
            ? "Installing..."
            : isPulling[selectedModel]
              ? `${Math.round(pullProgress[selectedModel] || 0)}%`
              : "Download"}
        </span>
      </div>
    </Button>
  );
};
