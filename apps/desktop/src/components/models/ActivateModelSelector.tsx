import { useOllamaStore } from "@/store/ollamaStore";
import { useAIProviderStore } from "@/store/aiProviderStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { AlertCircle } from "lucide-react";

export function ActivateModelSelector() {
  const { installedModels, isOllamaRunning } = useOllamaStore();
  const { activeModel, setActiveModel, isModelAvailable, availableModels } =
    useAIProviderStore();

  const handleModelChange = async (value: string) => {
    setActiveModel(value);
  };

  // Get model display names
  const getModelDisplayName = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    return model?.displayName || modelId;
  };

  return (
    <div className="space-y-2">
      <Select
        value={activeModel || undefined}
        onValueChange={handleModelChange}
      >
        <SelectTrigger id="model-selector">
          <SelectValue placeholder="Select a model">
            <div className="flex flex-row items-center w-full gap-1">
              <span>{getModelDisplayName(activeModel || "")}</span>
              {activeModel && !isModelAvailable(activeModel) && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {installedModels.map((modelId) => {
            const available = isModelAvailable(modelId);
            return (
              <SelectItem
                key={modelId}
                value={modelId}
                className={cn(
                  "flex items-center justify-between",
                  !available && "text-muted-foreground",
                )}
              >
                <span>{getModelDisplayName(modelId)}</span>
                {!available && (
                  <span className="text-yellow-500 text-sm ml-2">
                    (unavailable)
                  </span>
                )}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
