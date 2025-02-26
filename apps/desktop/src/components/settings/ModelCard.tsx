import type { ModelInfo } from "@/lib/aiModels";
import { Switch } from "@repo/ui/components/ui/switch";
import { Delete, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

interface ModelCardProps {
  model: ModelInfo;
  enabled: boolean;
  onToggle: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
  onUninstall?: (modelId: string) => void;
  isDefaultModel?: boolean;
  isInstalled?: boolean;
}

export function ModelCard({
  model,
  enabled,
  onToggle,
  onDelete,
  onUninstall,
  isDefaultModel = false,
  isInstalled = false,
}: ModelCardProps) {
  const getExternalLinkData = () => {
    switch (model.provider) {
      case "openrouter":
        return {
          url: `https://openrouter.ai/${model.id}`,
          title: "View on OpenRouter",
          show: true,
        };
      case "openai":
        return {
          url: `https://platform.openai.com/docs/models#${model.id}`,
          title: "View OpenAI Models Documentation",
          show: true,
        };
      case "ollama":
        return {
          url: `https://ollama.com/library/${model.id.split(":")[0]}`,
          title: "View in Ollama Library",
          show: true,
        };
      default:
        return { url: "", title: "", show: false };
    }
  };

  const externalLink = getExternalLinkData();

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{model.displayName}</h3>
              {externalLink.show && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 cursor-pointer"
                  asChild
                >
                  <a
                    href={externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={externalLink.title}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {model.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tag === "Featured"
                      ? "bg-blue-100 text-blue-800"
                      : tag === "Free"
                        ? "bg-green-100 text-green-800"
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                {model.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {model.contextLength && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Context:</span>
                  <span>{model.contextLength.toLocaleString()} tokens</span>
                </div>
              )}
              {model.provider === "ollama" && "size" in model && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Size:</span>
                  <span>{model.size}</span>
                </div>
              )}
              {model.provider === "ollama" && "parameters" in model && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Parameters:</span>
                  <span>{model.parameters}</span>
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
          <div className="flex items-center gap-2">
            {!(model.provider === "ollama" && !isInstalled) && (
              <Switch
                checked={enabled}
                onCheckedChange={() => onToggle(model.id)}
              />
            )}

            {(model.provider === "ollama" || !isDefaultModel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isDefaultModel && onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(model.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Delete className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {model.provider === "ollama" &&
                    isInstalled &&
                    onUninstall && (
                      <DropdownMenuItem onClick={() => onUninstall(model.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Uninstall
                      </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
