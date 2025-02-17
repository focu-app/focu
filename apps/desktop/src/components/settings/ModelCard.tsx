import { ModelInfo } from "@/lib/aiModels";
import { Switch } from "@repo/ui/components/ui/switch";

interface ModelCardProps {
  model: ModelInfo;
  enabled: boolean;
  onToggle: (modelId: string) => void;
}

export function ModelCard({ model, enabled, onToggle }: ModelCardProps) {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="space-y-1">
        <div className="text-sm font-medium leading-none">
          {model.displayName}
          {model.tags && model.tags.length > 0 && (
            <span className="ml-2">
              {model.tags.map((tag) => (
                <span
                  key={tag}
                  className="ml-1 inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
        {model.description && (
          <div className="text-xs text-muted-foreground max-w-lg">
            {model.description}
          </div>
        )}
        <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          {model.contextLength && (
            <div>Context: {model.contextLength.toLocaleString()} tokens</div>
          )}
          {(typeof model.priceIn === "number" ||
            typeof model.priceOut === "number") && (
            <div>
              Price:{" "}
              {typeof model.priceIn === "number" &&
                `$${model.priceIn}/1M input tokens`}
              {typeof model.priceIn === "number" &&
                typeof model.priceOut === "number" &&
                " | "}
              {typeof model.priceOut === "number" &&
                `$${model.priceOut}/1M output tokens`}
            </div>
          )}
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={() => onToggle(model.id)} />
    </div>
  );
}
