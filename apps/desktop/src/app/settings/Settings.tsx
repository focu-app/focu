"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useCallback, useEffect } from "react";
import { useOllamaStore } from "../store";

export function Settings() {
  const {
    installedModels,
    activeModel,
    activatingModel,
    deactivatingModel,
    pullProgress,
    isPulling,
    isOllamaRunning,
    fetchInstalledModels,
    fetchActiveModel,
    pullModel,
    stopPull,
    activateModel,
    checkOllamaStatus,
    initializeApp,
  } = useOllamaStore();

  const availableModels = ["llama3.1:latest", "ajindal/llama3.1-storm:8b"];

  const refreshData = useCallback(async () => {
    await checkOllamaStatus();
    if (isOllamaRunning) {
      await fetchInstalledModels();
      await fetchActiveModel();
    }
  }, [
    checkOllamaStatus,
    fetchInstalledModels,
    fetchActiveModel,
    isOllamaRunning,
  ]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const allModels = Array.from(
    new Set([...installedModels, ...availableModels]),
  );

  const handleModelToggle = (model: string) => {
    if (activeModel === model && !activatingModel) {
      activateModel(null);
    } else if (activeModel !== model) {
      activateModel(model);
    }
  };

  const getModelStatus = (model: string): string => {
    if (activatingModel === model) {
      return "Activating...";
    }
    if (
      deactivatingModel === model ||
      (activatingModel && activeModel === model)
    ) {
      return "Deactivating...";
    }
    if (activeModel === model && !activatingModel) {
      return "Active";
    }
    return "Inactive";
  };

  const isSwitchChecked = (model: string): boolean => {
    return (
      (activeModel === model && !activatingModel) || activatingModel === model
    );
  };

  return (
    <div className="flex-grow overflow-y-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ollama Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-lg font-semibold ${
              isOllamaRunning ? "text-green-600" : "text-red-600"
            }`}
          >
            {isOllamaRunning ? "Running" : "Not Running"}
          </p>
          {!isOllamaRunning && (
            <p className="text-sm text-gray-600 mt-2">
              Ollama is not running. Please start Ollama and refresh the
              settings.
            </p>
          )}
          <Button onClick={refreshData} className="mt-2" size="sm">
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {isOllamaRunning ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allModels.map((model) => {
              const isInstalled = installedModels.includes(model);
              const modelStatus = getModelStatus(model);
              const isActivating = activatingModel === model;
              const isDeactivating =
                deactivatingModel === model ||
                (activatingModel && activeModel === model);
              return (
                <TableRow key={model}>
                  <TableCell>{model}</TableCell>
                  <TableCell>
                    {isInstalled ? "Installed" : "Not Installed"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {isInstalled ? (
                        <>
                          <Switch
                            checked={isSwitchChecked(model)}
                            onCheckedChange={() => handleModelToggle(model)}
                            disabled={
                              !isOllamaRunning ||
                              Boolean(activatingModel) ||
                              Boolean(deactivatingModel)
                            }
                          />
                          <span>{modelStatus}</span>
                        </>
                      ) : (
                        <div className="flex items-center h-10">
                          <Button
                            onClick={() =>
                              isPulling[model]
                                ? stopPull(model)
                                : pullModel(model)
                            }
                            variant={
                              isPulling[model] ? "destructive" : "default"
                            }
                            size="sm"
                            className="w-20"
                            disabled={!isOllamaRunning}
                          >
                            {isPulling[model] ? "Stop" : "Install"}
                          </Button>
                          <div
                            className={`ml-2 flex items-center ${
                              isPulling[model] ? "opacity-100" : "opacity-0"
                            } transition-opacity duration-200`}
                          >
                            <Progress
                              value={pullProgress[model] || 0}
                              className="w-[100px] mr-2"
                            />
                            <span className="text-sm w-12">
                              {Math.round(pullProgress[model] || 0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500 mt-4">
          Ollama is not running. Please start Ollama to view and manage models.
        </p>
      )}
    </div>
  );
}
