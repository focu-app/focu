import { useOllamaStore } from "@/app/store";
import { getChat, updateChat } from "@/database/chats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";
import { toast } from "@repo/ui/hooks/use-toast";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

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
  const { installedModels, isModelAvailable } = useOllamaStore();

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
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating chat model:", error);
      toast({
        title: "Error updating model",
        description: "Failed to update the chat model",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Get all unique models (installed + current chat model if not installed)
  const allModels = [
    ...new Set([...installedModels, ...(chat?.model ? [chat.model] : [])]),
  ];

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
              <span>{chat?.model}</span>
              {chat?.model && !isModelAvailable(chat.model) && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allModels.map((model) => {
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
