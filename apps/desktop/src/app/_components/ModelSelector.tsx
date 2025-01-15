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
  const { installedModels } = useOllamaStore();

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

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label htmlFor="model-selector">Chat Model</Label>}
      <Select
        value={chat?.model || ""}
        onValueChange={handleModelChange}
        disabled={disabled || !chatId}
      >
        <SelectTrigger id="model-selector">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {installedModels.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
