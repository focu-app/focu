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
import { ShortcutInput } from "./ShortcutInput";
import { Label } from "@repo/ui/components/ui/label";
import {
  modelOptions,
  useModelManagement,
  ModelDownloadButton,
} from "./ModelManagement";

export function Settings() {
  const {
    installedModels,
    activeModel,
    activatingModel,
    deactivatingModel,
    isOllamaRunning,
    fetchInstalledModels,
    fetchActiveModel,
    checkOllamaStatus,
    globalShortcut,
    setGlobalShortcut,
    isSuggestedRepliesEnabled,
    setIsSuggestedRepliesEnabled,
  } = useOllamaStore();

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
    refreshData();
  }, [refreshData]);

  const handleShortcutChange = async (newShortcut: string) => {
    try {
      await setGlobalShortcut(newShortcut);
    } catch (error) {
      console.error("Failed to set global shortcut:", error);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Ollama</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
          {isOllamaRunning && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelOptions.map((model) => {
                  const isInstalled = installedModels.includes(model.name);
                  const { handleModelActivation } = useModelManagement(
                    model.name,
                  );
                  return (
                    <TableRow key={model.name}>
                      <TableCell>{model.name}</TableCell>
                      <TableCell>
                        {isInstalled ? "Installed" : "Not Installed"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isInstalled ? (
                            <>
                              <Switch
                                checked={activeModel === model.name}
                                onCheckedChange={() => handleModelActivation()}
                                disabled={
                                  !isOllamaRunning ||
                                  Boolean(activatingModel) ||
                                  Boolean(deactivatingModel)
                                }
                              />
                              <span>
                                {activatingModel === model.name
                                  ? "Activating..."
                                  : activeModel === model.name
                                    ? "Active"
                                    : "Inactive"}
                              </span>
                            </>
                          ) : (
                            <ModelDownloadButton selectedModel={model.name} />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="global-shortcut">Open Focu</Label>
            <div className="flex items-center gap-2">
              <ShortcutInput
                value={globalShortcut}
                onChange={handleShortcutChange}
              />
              <Button
                onClick={() => handleShortcutChange("Command+Shift+I")}
                size="sm"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Chat Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="suggested-replies"
              checked={isSuggestedRepliesEnabled}
              onCheckedChange={setIsSuggestedRepliesEnabled}
            />
            <Label htmlFor="suggested-replies">Enable Suggested Replies</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
