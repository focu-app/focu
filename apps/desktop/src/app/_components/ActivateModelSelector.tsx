import { useOllamaStore } from "@/app/store";
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
  const {
    installedModels,
    isModelAvailable,
    selectedModel,
    setSelectedModel,
    activateModel,
  } = useOllamaStore();

  const handleModelChange = async (value: string) => {
    setSelectedModel(value);
    activateModel(value);
  };

  return (
    <div className="space-y-2">
      <Select
        value={selectedModel || undefined}
        onValueChange={handleModelChange}
      >
        <SelectTrigger id="model-selector">
          <SelectValue placeholder="Select a model">
            <div className="flex flex-row items-center w-full gap-1">
              <span>{selectedModel}</span>
              {selectedModel && !isModelAvailable(selectedModel) && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {installedModels.map((model) => {
            const available = isModelAvailable(model);
            return (
              <SelectItem
                key={model}
                value={model}
                className={cn(
                  "flex items-center justify-between",
                  !available && "text-muted-foreground",
                )}
              >
                <span>{model}</span>
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
