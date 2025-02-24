import { getChat, updateChat } from "@/database/chats";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { toast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface ModelSelectorProps {
  chatId?: number;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
  onModelChange?: (model: string) => void;
}

export function ModelSelector({
  chatId,
  disabled = false,
  showLabel = true,
  className = "",
  onModelChange,
}: ModelSelectorProps) {
  const {
    availableModels,
    isModelAvailable: isCloudModelAvailable,
    getModelProvider,
    enabledModels,
    syncOllamaModels,
  } = useAIProviderStore();
  const {
    installedModels,
    isOllamaRunning,
    fetchInstalledModels,
    checkOllamaStatus,
  } = useOllamaStore();

  // Fetch Ollama models and sync with aiProviderStore when component mounts
  useEffect(() => {
    const syncModels = async () => {
      const running = await checkOllamaStatus();
      if (running) {
        await fetchInstalledModels();
        syncOllamaModels();
      }
    };
    syncModels();
  }, [checkOllamaStatus, fetchInstalledModels, syncOllamaModels]);

  const chat = useLiveQuery(async () => {
    if (!chatId) return null;
    return getChat(chatId);
  }, [chatId]);

  const handleModelChange = async (value: string) => {
    if (!chatId) return;

    try {
      await updateChat(chatId, { model: value });
      onModelChange?.(value);
      toast({
        title: "Chat model updated",
        description: `Model changed to ${value}`,
      });
    } catch (error) {
      console.error("Error updating chat model:", error);
      toast({
        title: "Error updating model",
        description: "Failed to update the chat model",
        variant: "destructive",
      });
    }
  };

  // Get all enabled models (both local and cloud)
  const allModels = [
    ...new Set([
      ...enabledModels.filter((modelId) => {
        const model = availableModels.find((m) => m.id === modelId);
        if (!model) return false;
        if (model.provider === "ollama") {
          return isOllamaRunning && installedModels.includes(modelId);
        }
        return isCloudModelAvailable(modelId);
      }),
      // Only include the current chat's model if it exists
      ...(chat?.model ? [chat.model] : []),
    ]),
  ];

  // Sort models by provider and put chat model at the top
  const sortedModels = [...allModels].sort((a, b) => {
    if (a === chat?.model) return -1;
    if (b === chat?.model) return 1;

    const providerA = getModelProvider(a) || "";
    const providerB = getModelProvider(b) || "";

    return providerA.localeCompare(providerB);
  });

  // Get model display names
  const getModelDisplayName = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    return model?.displayName || modelId;
  };

  // Check if a model is available (either cloud or local)
  const isModelAvailable = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (!model) return false;

    if (model.provider === "ollama") {
      return isOllamaRunning && installedModels.includes(modelId);
    }

    return isCloudModelAvailable(modelId);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label htmlFor="model-selector">Chat Model</Label>}
      <Select
        value={chat?.model || ""}
        onValueChange={handleModelChange}
        disabled={disabled || !chatId}
      >
        <SelectTrigger id="model-selector">
          <SelectValue placeholder="Select a model">
            <div className="flex flex-row items-center w-full gap-1">
              <span>{getModelDisplayName(chat?.model || "")}</span>
              {chat?.model && !isModelAvailable(chat.model) && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedModels.map((modelId) => {
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
                <span>
                  {getModelDisplayName(modelId)} - {getModelProvider(modelId)}
                </span>
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
