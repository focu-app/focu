import { useAIProviderStore } from "@/store/aiProviderStore";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

export function DefaultModelSelector() {
  const {
    activeModel,
    setActiveModel,
    enabledModels,
    availableModels,
    isModelAvailable,
  } = useAIProviderStore();

  // Get all enabled and available models across providers
  const availableEnabledModels = availableModels.filter(
    (model) => enabledModels.includes(model.id) && isModelAvailable(model.id),
  );

  // Sort models by provider and put active model at the top
  const sortedModels = [...availableEnabledModels].sort((a, b) => {
    if (a.id === activeModel) return -1;
    if (b.id === activeModel) return 1;

    return a.provider.localeCompare(b.provider);
  });

  if (availableEnabledModels.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Default Model</Label>
        <p className="text-sm text-muted-foreground">
          No models are currently enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Default Model</Label>
      <Select
        value={activeModel || ""}
        onValueChange={(value) => setActiveModel(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a default model" />
        </SelectTrigger>
        <SelectContent>
          {sortedModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.displayName} - {model.provider}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        This model will be used by default for new chats
      </p>
    </div>
  );
}
