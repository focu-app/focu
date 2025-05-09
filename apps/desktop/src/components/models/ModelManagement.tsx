import { useAIProviderStore } from "@/store/aiProviderStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { PlusCircle, Trash2, Download, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useOllamaStore } from "../../store/ollamaStore";

interface ModelManagementProps {
  provider: AIProvider;
}

interface NewModelFormData {
  id: string;
  displayName: string;
  description: string;
}

export function ModelManagement({ provider }: ModelManagementProps) {
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

    const newModel: ModelInfo = {
      id: trimmedId,
      displayName: newModelForm.displayName || trimmedId,
      provider,
      description: newModelForm.description,
      contextLength: 128000, // Default to a reasonable context length
      priceIn: null,
      priceOut: null,
      tags: ["Custom"],
    } as CloudModelInfo;

    addModel(newModel);
    setNewModelForm({
      id: "",
      displayName: "",
      description: "",
    });
    setFormError(null);
    setIsNewModelDialogOpen(false);
    toast({
      title: "Model added",
      description: "The new model has been added to the list.",
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

  const providerModels = availableModels.filter((m) => m.provider === provider);

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
        {providerModels.map((model) => (
          <div
            key={model.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <ModelCard
                model={model}
                enabled={enabledModels.includes(model.id)}
                onToggle={toggleModel}
              />
            </div>
            {!DEFAULT_MODELS.some((m) => m.id === model.id) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteModel(model.id)}
                className="h-8 w-8 p-0 mt-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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

export const useModelManagement = (selectedModel: string) => {
  const {
    isOllamaRunning,
    pullModel,
    stopPull,
    isPulling,
    pullProgress,
    installedModels,
    fetchInstalledModels,
  } = useOllamaStore();

  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    fetchInstalledModels();
  }, [fetchInstalledModels]);

  useEffect(() => {
    if (pullProgress[selectedModel] === 100) {
      setIsInstalling(true);
    } else if (!isPulling[selectedModel]) {
      setIsInstalling(false);
    }
  }, [pullProgress, isPulling, selectedModel]);

  const handleModelDownload = () => {
    if (isPulling[selectedModel]) {
      stopPull(selectedModel);
    } else {
      pullModel(selectedModel);
    }
  };

  return {
    isDownloading: isPulling[selectedModel] || isInstalling,
    isInstalling,
    handleModelDownload,
  };
};

export const ModelDownloadButton: React.FC<{ selectedModel: string }> = ({
  selectedModel,
}) => {
  const { isOllamaRunning, isPulling, pullProgress } = useOllamaStore();
  const { isInstalling, handleModelDownload } =
    useModelManagement(selectedModel);

  return (
    <Button
      onClick={handleModelDownload}
      className="w-[200px]"
      disabled={!isOllamaRunning || isInstalling}
      variant="default"
    >
      <div className="flex items-center justify-center gap-2">
        {isPulling[selectedModel] ? (
          <StopCircle className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>
          {isInstalling
            ? "Installing..."
            : isPulling[selectedModel]
              ? `${Math.round(pullProgress[selectedModel] || 0)}%`
              : "Download"}
        </span>
      </div>
    </Button>
  );
};
