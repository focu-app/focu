import { useAIProviderStore } from "@/store/aiProviderStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { invoke } from "@tauri-apps/api/core";
import type { AIProvider, ModelInfo, CloudModelInfo } from "@/lib/aiModels";
import { DEFAULT_MODELS } from "@/lib/aiModels";
import { ApiKeyInput } from "./ApiKeyInput";
import { Button } from "@repo/ui/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
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
import { ModelCard } from "./ModelCard";
import { DefaultModelSelector } from "./DefaultModelSelector";

interface ProviderSettingsProps {
  provider: AIProvider;
  title: string;
  keyPlaceholder: string;
}

interface NewModelFormData {
  id: string;
  displayName: string;
  description: string;
}

export function ProviderSettings({
  provider,
  title,
  keyPlaceholder,
}: ProviderSettingsProps) {
  const {
    updateProvider,
    enabledModels,
    toggleModel,
    addModel,
    removeModel,
    availableModels,
  } = useAIProviderStore();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isNewModelDialogOpen, setIsNewModelDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [newModelForm, setNewModelForm] = useState<NewModelFormData>({
    id: "",
    displayName: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Load API key on mount
  useEffect(() => {
    const loadKey = async () => {
      try {
        const key = await invoke<string | null>("get_api_key", {
          keyName: provider,
        });
        if (key) {
          setApiKey(key);
        }
      } catch (error) {
        console.error(`Failed to load ${provider} API key:`, error);
      }
    };
    loadKey();
  }, [provider]);

  const handleUpdateConfig = async (value: string) => {
    setApiKey(value);
    await updateProvider(provider, { apiKey: value });
  };

  const handleToggleModel = (modelId: string) => {
    toggleModel(modelId);
  };

  const handleSave = () => {
    showSettingsSavedToast(toast);
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

  const defaultModels = DEFAULT_MODELS.filter((m) => m.provider === provider);
  const customModels = availableModels.filter(
    (m) =>
      m.provider === provider && !DEFAULT_MODELS.some((d) => d.id === m.id),
  );
  const allModels = [...defaultModels, ...customModels];

  return (
    <SettingsCard title={title} onSave={handleSave}>
      <div className="space-y-6">
        <ApiKeyInput
          value={apiKey}
          onChange={handleUpdateConfig}
          placeholder={keyPlaceholder}
        />

        <DefaultModelSelector />

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
                  {formError && (
                    <p className="text-sm text-red-500">{formError}</p>
                  )}
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
              <div
                key={model.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <ModelCard
                    model={model}
                    enabled={enabledModels.includes(model.id)}
                    onToggle={handleToggleModel}
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
        </div>
      </div>

      <AlertDialog
        open={!!modelToDelete}
        onOpenChange={() => setModelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this model? This action cannot be
              undone.
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
    </SettingsCard>
  );
}
