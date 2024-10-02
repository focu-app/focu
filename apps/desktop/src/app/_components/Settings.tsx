"use client";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { ShortcutInput } from "./ShortcutInput";
import { useOllamaStore } from "../store";
import { modelOptions, ModelDownloadButton } from "./ModelManagement";

type Category = "General" | "AI" | "Pomodoro" | "Shortcuts";

function SettingsSidebar({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}) {
  const categories: Category[] = ["General", "AI", "Pomodoro", "Shortcuts"];

  return (
    <div className="w-48 border-r border-gray-200 p-4">
      <div className="flex flex-col space-y-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add general settings content here */}
        <p>General settings content goes here.</p>
      </CardContent>
    </Card>
  );
}

function AISettings() {
  const {
    installedModels,
    activeModel,
    activatingModel,
    deactivatingModel,
    isOllamaRunning,
    fetchInstalledModels,
    fetchActiveModel,
    checkOllamaStatus,
    activateModel,
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

  const handleModelToggle = useCallback(
    (model: string) => {
      if (activeModel === model) {
        activateModel(null); // Deactivate the model
      } else {
        activateModel(model); // Activate the model
      }
    },
    [activeModel, activateModel],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-lg font-semibold mb-4 ${
            isOllamaRunning ? "text-green-600" : "text-red-600"
          }`}
        >
          Ollama: {isOllamaRunning ? "Running" : "Not Running"}
        </p>
        {!isOllamaRunning && (
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Ollama is not running. Please start Ollama and refresh the settings.
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
                              onCheckedChange={() =>
                                handleModelToggle(model.name)
                              }
                              disabled={
                                !isOllamaRunning ||
                                Boolean(activatingModel) ||
                                Boolean(deactivatingModel)
                              }
                            />
                            <span>
                              {activatingModel === model.name
                                ? "Activating..."
                                : deactivatingModel === model.name
                                  ? "Deactivating..."
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
  );
}

function PomodoroSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Pomodoro settings content here */}
        <p>Pomodoro settings content goes here.</p>
      </CardContent>
    </Card>
  );
}

function ShortcutSettings() {
  const { globalShortcut, setGlobalShortcut } = useOllamaStore();

  const handleShortcutChange = async (newShortcut: string) => {
    try {
      await setGlobalShortcut(newShortcut);
    } catch (error) {
      console.error("Failed to set global shortcut:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shortcut Settings</CardTitle>
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
  );
}

export function Settings() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");

  const renderContent = () => {
    switch (activeCategory) {
      case "General":
        return <GeneralSettings />;
      case "AI":
        return <AISettings />;
      case "Pomodoro":
        return <PomodoroSettings />;
      case "Shortcuts":
        return <ShortcutSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <SettingsSidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <div className="flex-grow p-6 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
