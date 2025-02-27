import { useAIProviderStore } from "@/store/aiProviderStore";
import { Label } from "@repo/ui/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@repo/ui/lib/utils";

export function DefaultModelSelector() {
  const {
    activeModel,
    setActiveModel,
    enabledModels,
    availableModels,
    isModelAvailable,
  } = useAIProviderStore();

  const [open, setOpen] = useState(false);

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

  const activeModelInfo = availableEnabledModels.find(
    (model) => model.id === activeModel,
  );

  return (
    <div className="space-y-2">
      <Label>Default Model</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {activeModel && activeModelInfo
              ? `${activeModelInfo.displayName} - ${activeModelInfo.provider}`
              : "Select a default model"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          alignOffset={0}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              <CommandGroup>
                {sortedModels.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`${model.displayName} ${model.provider}`}
                    onSelect={() => {
                      setActiveModel(model.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeModel === model.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {model.displayName} - {model.provider}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        This model will be used by default for new chats
      </p>
    </div>
  );
}
