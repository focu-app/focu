import type { ModelInfo } from "@/lib/aiModels";
import { Switch } from "@repo/ui/components/ui/switch";
import { ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface ModelCardProps {
  model: ModelInfo;
  enabled: boolean;
  onToggle: (modelId: string) => void;
}

export function ModelCard({ model, enabled, onToggle }: ModelCardProps) {
  return (
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{model.displayName}</h3>
            {(model.provider === "openrouter" ||
              model.provider === "openai") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 cursor-pointer"
                asChild
              >
                <a
                  href={
                    model.provider === "openrouter"
                      ? `https://openrouter.ai/${model.id}`
                      : `https://platform.openai.com/docs/models#${model.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  title={
                    model.provider === "openrouter"
                      ? "View on OpenRouter"
                      : "View OpenAI Models Documentation"
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {model.tags?.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full ${
                  tag === "Featured"
                    ? "bg-blue-100 text-blue-800"
                    : tag === "Custom"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          {model.description && (
            <p className="text-sm text-muted-foreground">{model.description}</p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground">
            {model.contextLength && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Context:</span>
                <span>{model.contextLength.toLocaleString()} tokens</span>
              </div>
            )}
            {(typeof model.priceIn === "number" ||
              typeof model.priceOut === "number") && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Price:</span>
                <span>
                  {typeof model.priceIn === "number" &&
                    `$${model.priceIn}/1M input tokens`}
                  {typeof model.priceIn === "number" &&
                    typeof model.priceOut === "number" &&
                    " | "}
                  {typeof model.priceOut === "number" &&
                    `$${model.priceOut}/1M output tokens`}
                </span>
              </div>
            )}
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={() => onToggle(model.id)} />
      </div>
    </div>
  );
}
