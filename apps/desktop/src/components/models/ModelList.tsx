import { useAIProviderStore } from "@/store/aiProviderStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import type { AIProvider, ModelInfo, CloudModelInfo } from "@/lib/aiModels";
import { DEFAULT_MODELS } from "@/lib/aiModels";
import { ModelCard } from "../settings/ModelCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";

interface ModelListProps {
  provider: AIProvider;
}

interface NewModelFormData {
  id: string;
  displayName: string;
  description: string;
}

export function ModelList({ provider }: ModelListProps) {
  const {
    enabledModels,
    toggleModel,
    addModel,
    removeModel,
    availableModels,
    activeModel,
    setActiveModel,
  } = useAIProviderStore();
  const { toast } = useToast();
  const [isNewModelDialogOpen, setIsNewModelDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [newModelForm, setNewModelForm] = useState<NewModelFormData>({
    id: "",
    displayName: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleToggleModel = (modelId: string) => {
    const isEnabled = enabledModels.includes(modelId);
    toggleModel(modelId);

    // If we're disabling the current default model, find a new default
    if (isEnabled && modelId === activeModel) {
      const remainingEnabledModels = enabledModels
        .filter((id) => id !== modelId)
        .map((id) => availableModels.find((m) => m.id === id)) as ModelInfo[];

      if (remainingEnabledModels.length > 0) {
        setActiveModel(remainingEnabledModels[0].id);
        toast({
          title: "Default model updated",
          description: `Default model has been changed to ${remainingEnabledModels[0].displayName}`,
        });
      } else {
        setActiveModel(null);
        toast({
          title: "Default model cleared",
          description: "No enabled models available to set as default",
        });
      }
    }
  };

  const handleAddModel = () => {
    const trimmedId = newModelForm.id.trim();
    if (!trimmedId) {
      setFormError("Model ID is required");
      return;
    }

    const modelExists = availableModels.some((model) => model.id === trimmedId);

    if (modelExists) {
      setFormError("A model with this ID already exists");
      return;
    }

    // Ensure provider is a valid cloud provider
    if (provider === "ollama") {
      setFormError("Cannot add custom models for Ollama provider");
      return;
    }

    const newModel: ModelInfo = {
      id: trimmedId,
      displayName: newModelForm.displayName || trimmedId,
      provider,
      description: newModelForm.description,
      contextLength: 128000, // Default to a reasonable context length
      priceIn: null,
      priceOut: null,
      tags: ["Custom"],
    } as CloudModelInfo; // Safe to cast since we checked provider !== "ollama"

    addModel(newModel);
    // Automatically enable the newly added model
    toggleModel(trimmedId);

    setNewModelForm({
      id: "",
      displayName: "",
      description: "",
    });
    setFormError(null);
    setIsNewModelDialogOpen(false);
    toast({
      title: "Model added",
      description: "The new model has been added and enabled.",
    });
  };

  const handleDeleteModel = (modelId: string) => {
    const isDefaultModel = DEFAULT_MODELS.some((m) => m.id === modelId);
    if (isDefaultModel) {
      toast({
        title: "Cannot remove default model",
        description: "This is a default model and cannot be removed.",
      });
      return;
    }
    setModelToDelete(modelId);
  };

  const handleConfirmDelete = () => {
    if (modelToDelete) {
      removeModel(modelToDelete);
      setModelToDelete(null);
      toast({
        title: "Model removed",
        description: "The model has been removed from the list.",
      });
    }
  };

  const defaultModels = DEFAULT_MODELS.filter((m) => m.provider === provider);
  const customModels = availableModels.filter(
    (m) =>
      m.provider === provider && !DEFAULT_MODELS.some((d) => d.id === m.id),
  );
  const allModels = [...defaultModels, ...customModels];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Models</h3>
        <Dialog
          open={isNewModelDialogOpen}
          onOpenChange={setIsNewModelDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {(provider === "openai" || provider === "openrouter") && (
                <p className="text-sm text-muted-foreground">
                  Browse available models at{" "}
                  <a
                    href={
                      provider === "openai"
                        ? "https://platform.openai.com/docs/models"
                        : "https://openrouter.ai/models"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {provider === "openai"
                      ? "platform.openai.com/docs/models"
                      : "openrouter.ai/models"}
                  </a>
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="id">Model ID</Label>
                <Input
                  id="id"
                  value={newModelForm.id}
                  onChange={(e) => {
                    setNewModelForm((prev) => ({
                      ...prev,
                      id: e.target.value,
                    }));
                    setFormError(null);
                  }}
                  placeholder="e.g., gpt-4-turbo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={newModelForm.displayName}
                  onChange={(e) =>
                    setNewModelForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="e.g., GPT-4 Turbo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newModelForm.description}
                  onChange={(e) =>
                    setNewModelForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter a description for the model"
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddModel}>Add Model</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {allModels.map((model) => (
          <div key={model.id} className="group relative">
            <ModelCard
              model={model}
              enabled={enabledModels.includes(model.id)}
              onToggle={handleToggleModel}
              onDelete={handleDeleteModel}
              isDefaultModel={DEFAULT_MODELS.some((m) => m.id === model.id)}
            />
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!modelToDelete}
        onOpenChange={() => setModelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this model?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
