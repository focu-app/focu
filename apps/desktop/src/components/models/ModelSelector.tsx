import { getChat, updateChat } from "@/database/chats";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { Label } from "@repo/ui/components/ui/label";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { toast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";

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
    setActiveModel,
  } = useAIProviderStore();
  const {
    installedModels,
    isOllamaRunning,
    fetchInstalledModels,
    checkOllamaStatus,
  } = useOllamaStore();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function syncModels() {
      const running = await checkOllamaStatus();
      if (running) {
        await fetchInstalledModels();
      }
    }
    syncModels();
  }, [checkOllamaStatus, fetchInstalledModels]);

  const chat = useLiveQuery(async () => {
    if (!chatId) return null;
    return getChat(chatId);
  }, [chatId]);

  const handleModelChange = async (value: string) => {
    if (!chatId) return;

    try {
      await updateChat(chatId, { model: value });

      // Also update the default active model for future chats
      setActiveModel(value);

      onModelChange?.(value);
      toast({
        title: "Chat model updated",
        description: `Model changed to ${value} and set as default for new chats`,
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
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            id="model-selector"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || !chatId}
            className="w-full justify-between"
          >
            <div className="flex flex-row items-center w-full gap-1 overflow-hidden">
              <span className="truncate">
                {getModelDisplayName(chat?.model || "")}
              </span>
              {chat?.model && !isModelAvailable(chat.model) && (
                <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          alignOffset={0}
          style={{
            minWidth: "var(--radix-popover-trigger-width)",
            width: "auto",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <Command className="w-full">
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              <CommandGroup>
                {sortedModels.map((modelId) => {
                  const available = isModelAvailable(modelId);
                  const displayName = getModelDisplayName(modelId);
                  const provider = getModelProvider(modelId);

                  return (
                    <CommandItem
                      key={modelId}
                      value={`${displayName} ${provider}`}
                      onSelect={() => {
                        handleModelChange(modelId);
                        setOpen(false);
                      }}
                      className={cn(!available && "text-muted-foreground")}
                      disabled={!available}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              chat?.model === modelId
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span>
                            {displayName} - {provider}
                          </span>
                        </div>
                        {!available && (
                          <span className="text-yellow-500 text-sm ml-2 flex-shrink-0">
                            (unavailable)
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
