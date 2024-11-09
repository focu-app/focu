import { useOllamaStore, defaultModels } from "@/app/store";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { Card } from "@repo/ui/components/ui/card";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Trash2, PlusCircle } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ModelDownloadButton } from "../ModelManagement";
import StartOllamaButton from "../StartOllamaButton";
import { SettingsCard } from "./SettingsCard";
import { showSettingsSavedToast } from "./Settings";
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

export function ModelSettings() {
  const {
    installedModels,
    activeModel,
    activatingModel,
    deactivatingModel,
    isOllamaRunning,
    fetchInstalledModels,
    checkOllamaStatus,
    activateModel,
    modelOptions,
    addModelOption,
    removeModelOption,
  } = useOllamaStore();
  const { toast } = useToast();
  const [newModelName, setNewModelName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modelNameError, setModelNameError] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  console.log("modelOptions", modelOptions);

  const refreshData = useCallback(async () => {
    await checkOllamaStatus();
    if (isOllamaRunning) {
      await fetchInstalledModels();
    }
  }, [checkOllamaStatus, fetchInstalledModels, isOllamaRunning]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleModelToggle = useCallback(
    (model: string) => {
      console.log("handleModelToggle", model);
      if (activeModel === model) {
        activateModel(null); // Deactivate the model
      } else {
        activateModel(model); // Activate the model
      }
    },
    [activeModel, activateModel],
  );

  const handleSave = () => {
    // AI settings are saved immediately when changed, so we just show a toast
    showSettingsSavedToast(toast);
  };

  const handleAddModel = () => {
    const trimmedModelName = newModelName.trim().toLowerCase();

    if (trimmedModelName) {
      // Check against both default models and custom model options
      const modelExists = [...defaultModels, ...modelOptions].some(
        (model) => model.name.toLowerCase() === trimmedModelName,
      );

      if (modelExists) {
        setModelNameError("This model already exists in the list.");
        return;
      }

      addModelOption({ name: trimmedModelName, size: "N/A" });
      setNewModelName("");
      setModelNameError(null);
      setIsDialogOpen(false);
      toast({
        title: "Model added",
        description: "The new model has been added to the list.",
        duration: 3000,
      });
    } else {
      setModelNameError(
        "Please enter a valid model name in the format model:tag such as llama3.2:latest or llama3.2:1b",
      );
    }
  };

  const handleDeleteModel = (modelName: string) => {
    // Check if the model is one of the default models
    const isDefaultModel = defaultModels.map((m) => m.name).includes(modelName);

    if (isDefaultModel) {
      toast({
        title: "Cannot remove default model",
        description: "This is a default model and cannot be removed.",
        duration: 3000,
      });
    } else {
      setModelToDelete(modelName);
    }
  };

  const handleConfirmDelete = () => {
    if (modelToDelete) {
      removeModelOption(modelToDelete);
      toast({
        title: "Model removed",
        description: "The model has been removed from the list.",
        duration: 3000,
      });
      setModelToDelete(null);
    }
  };

  const allModels = useMemo(() => {
    const modelMap = new Map();

    for (const model of defaultModels) {
      modelMap.set(model.name.toLowerCase(), model);
    }

    for (const model of modelOptions) {
      if (!modelMap.has(model.name.toLowerCase())) {
        modelMap.set(model.name.toLowerCase(), model);
      }
    }

    return Array.from(modelMap.values());
  }, [modelOptions]);

  return (
    <SettingsCard title="AI Settings" onSave={handleSave}>
      <p
        className={`text-lg font-semibold mb-4 ${
          isOllamaRunning ? "text-green-600" : "text-red-600"
        }`}
      >
        Ollama: {isOllamaRunning ? "Running" : "Not Running"}
      </p>
      {!isOllamaRunning && (
        <div className="flex flex-row gap-2">
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Ollama is not running.
          </p>
          <StartOllamaButton />
        </div>
      )}
      {isOllamaRunning && (
        <>
          <div className="flex flex-col space-y-4 mb-4">
            {allModels.map((model) => {
              const isInstalled = installedModels.includes(model.name);
              const isDefaultModel = defaultModels
                .map((m) => m.name)
                .includes(model.name);

              return (
                <Card key={model.name} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{model.name}</h3>
                      <div className="flex gap-4">
                        <p className="text-sm text-muted-foreground">
                          Size: {model.size}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isInstalled ? "Installed" : "Not Installed"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-[300px] flex justify-end">
                        {isInstalled ? (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={activeModel === model.name}
                              onCheckedChange={() =>
                                handleModelToggle(model.name)
                              }
                              disabled={
                                !isOllamaRunning ||
                                Boolean(activatingModel) ||
                                Boolean(deactivatingModel)
                              }
                            />
                            <span className="text-sm w-[100px]">
                              {activatingModel === model.name
                                ? "Activating..."
                                : deactivatingModel === model.name
                                  ? "Deactivating..."
                                  : activeModel === model.name
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                          </div>
                        ) : (
                          <ModelDownloadButton selectedModel={model.name} />
                        )}
                      </div>

                      <div className="w-8">
                        {!isDefaultModel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModel(model.name)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Model</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4 py-4">
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
                    placeholder="e.g., llama3.2 or llama3.2:3b"
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

          <AlertDialog
            open={!!modelToDelete}
            onOpenChange={() => setModelToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the model "{modelToDelete}" from your list.
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
        </>
      )}
    </SettingsCard>
  );
}
