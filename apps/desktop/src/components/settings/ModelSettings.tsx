import { useAIProviderStore } from "@/store/aiProviderStore";
import { useOllamaStore, defaultModels } from "@/store/ollamaStore";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState, useMemo, useCallback } from "react";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
import { Button } from "@repo/ui/components/ui/button";
import { MoreVertical, Trash2, ExternalLink, PlusCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ModelDownloadButton } from "../models/ModelManagement";
import StartOllamaButton from "./StartOllamaButton";
import { DefaultModelSelector } from "./DefaultModelSelector";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ModelCard } from "./ModelCard";

export function ModelSettings() {
  const {
    installedModels,
    isOllamaRunning,
    fetchInstalledModels,
    checkOllamaStatus,
    getAllModels,
    addCustomModel,
    removeCustomModel,
    isNewModelDialogOpen,
    setIsNewModelDialogOpen,
    deleteModel: deleteOllamaModel,
    modelsLastUpdated,
  } = useOllamaStore();

  const { toggleModel, enabledModels } = useAIProviderStore();

  const { toast } = useToast();
  const [newModelName, setNewModelName] = useState("");
  const [modelNameError, setModelNameError] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [modelToUninstall, setModelToUninstall] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    await checkOllamaStatus();
    if (isOllamaRunning) {
      await fetchInstalledModels();
    }
  }, [checkOllamaStatus, fetchInstalledModels, isOllamaRunning]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  const handleAddModel = () => {
    const trimmedModelName = newModelName.trim().toLowerCase();

    if (trimmedModelName) {
      const allModels = getAllModels();
      const modelExists = allModels.some(
        (model) => model.name.toLowerCase() === trimmedModelName,
      );

      if (modelExists) {
        setModelNameError("This model already exists in the list.");
        return;
      }

      addCustomModel({ name: trimmedModelName, size: "N/A" });
      setNewModelName("");
      setModelNameError(null);
      setIsNewModelDialogOpen(false);
      toast({
        title: "Model added",
        description: "The new model has been added to the list.",
      });
    } else {
      setModelNameError(
        "Please enter a valid model name in the format model:tag such as llama3.2:latest or llama3.2:1b",
      );
    }
  };

  const handleDeleteModel = (modelName: string) => {
    const isDefaultModel = defaultModels.map((m) => m.name).includes(modelName);
    if (!isDefaultModel) {
      setModelToDelete(modelName);
    } else {
      toast({
        title: "Cannot remove default model",
        description:
          "This is a default model and cannot be removed from the list.",
      });
    }
  };

  const handleUninstallModel = (modelName: string) => {
    setModelToUninstall(modelName);
  };

  const handleConfirmUninstall = async () => {
    if (modelToUninstall) {
      try {
        await deleteOllamaModel(modelToUninstall);
        if (enabledModels.includes(modelToUninstall)) {
          toggleModel(modelToUninstall);
        }
        toast({
          title: "Model uninstalled",
          description: "The model has been uninstalled successfully.",
        });
      } catch (error) {
        console.error("Error uninstalling model:", error);
        toast({
          title: "Error uninstalling model",
          description: "Failed to uninstall the model. Please try again.",
          variant: "destructive",
        });
      }
      setModelToUninstall(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (modelToDelete) {
      try {
        if (installedModels.includes(modelToDelete)) {
          await deleteOllamaModel(modelToDelete);
          if (enabledModels.includes(modelToDelete)) {
            toggleModel(modelToDelete);
          }
          toast({
            title: "Model uninstalled",
            description: "The model has been uninstalled successfully.",
          });
        }

        // Remove from custom models list if it's not a default model
        const isDefaultModel = defaultModels
          .map((m) => m.name)
          .includes(modelToDelete);
        if (!isDefaultModel) {
          removeCustomModel(modelToDelete);
          toast({
            title: "Model removed",
            description: "The model has been removed from the list.",
          });
        }
      } catch (error) {
        console.error("Error deleting model:", error);
        toast({
          title: "Error removing model",
          description: "Failed to remove the model. Please try again.",
          variant: "destructive",
        });
      }
      setModelToDelete(null);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh when modelsLastUpdated changes
  const allModels = useMemo(() => {
    return getAllModels();
  }, [getAllModels, modelsLastUpdated]);

  return (
    <SettingsCard title="Local AI" onSave={handleSave}>
      <div className="space-y-6">
        <div className="space-y-4">
          <p
            className={`text-lg font-semibold ${
              isOllamaRunning ? "text-green-600" : "text-red-600"
            }`}
          >
            Ollama: {isOllamaRunning ? "Running" : "Not Running"}
          </p>
          <div className="flex flex-row">
            <StartOllamaButton />
          </div>
        </div>

        <div className="space-y-6">
          <DefaultModelSelector />
          {isOllamaRunning && (
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
                    <div className="flex flex-col space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Browse available models at{" "}
                        <a
                          href="https://ollama.com/models"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          ollama.com/models
                        </a>
                      </p>
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="name" className="w-20 flex-shrink-0">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newModelName}
                          onChange={(e) => {
                            setNewModelName(e.target.value.toLowerCase());
                            setModelNameError(null);
                          }}
                          className="flex-grow"
                          placeholder="e.g., llama3.2:latest or llama3.2:3b"
                        />
                      </div>
                      {modelNameError && (
                        <p className="text-sm text-red-500">{modelNameError}</p>
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
                {allModels.map((model) => {
                  const isInstalled = installedModels.includes(model.name);
                  const isDefaultModel = defaultModels
                    .map((m) => m.name)
                    .includes(model.name);

                  const modelInfo = {
                    id: model.name,
                    displayName: model.name,
                    provider: "ollama" as const,
                    description: model.description || "Custom Ollama model",
                    tags: model.tags || [],
                    size: model.size,
                    parameters: model.parameters || "unknown",
                  };

                  return (
                    <div key={model.name} className="group relative">
                      {isInstalled ? (
                        <ModelCard
                          model={modelInfo}
                          enabled={enabledModels.includes(model.name)}
                          onToggle={() => {
                            toggleModel(model.name);
                          }}
                          onDelete={handleDeleteModel}
                          onUninstall={handleUninstallModel}
                          isDefaultModel={isDefaultModel}
                          isInstalled={isInstalled}
                        />
                      ) : (
                        <Card className="w-full transition-all duration-200 hover:shadow-md">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">
                                    {model.name}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 cursor-pointer"
                                    asChild
                                  >
                                    <a
                                      href={`https://ollama.com/library/${model.name.split(":")[0]}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="View in Ollama Library"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  {model.recommended && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                      Recommended
                                    </span>
                                  )}
                                  {model.tags?.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className={`text-xs px-2 py-1 rounded-full font-medium ${
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
                                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Not Installed
                                  </span>
                                </div>
                                {model.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {model.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">Size:</span>
                                    <span>{model.size}</span>
                                  </div>
                                  {model.parameters && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">
                                        Parameters:
                                      </span>
                                      <span>{model.parameters}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ModelDownloadButton
                                  selectedModel={model.name}
                                />
                                {!isDefaultModel && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteModel(model.name)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

      <AlertDialog
        open={!!modelToUninstall}
        onOpenChange={() => setModelToUninstall(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uninstall Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to uninstall this model? The model will
              remain in the list but will need to be reinstalled before use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUninstall}>
              Uninstall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsCard>
  );
}
