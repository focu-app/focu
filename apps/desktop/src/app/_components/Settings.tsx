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
import { usePomodoroStore } from "../store/pomodoroStore";
import { Input } from "@repo/ui/components/ui/input";

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
    <div className="w-48 p-4 h-full flex-shrink-0">
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

function SettingsCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <Card className="h-full flex flex-col border-none">
      <CardContent className="flex-grow overflow-y-auto p-6 max-w-3xl">
        {children}
      </CardContent>
    </Card>
  );
}

function GeneralSettings() {
  return (
    <SettingsCard title="General Settings">
      {/* Add general settings content here */}
      <p>General settings content goes here.</p>
    </SettingsCard>
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
    <SettingsCard title="AI Settings">
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
    </SettingsCard>
  );
}

function PomodoroSettings() {
  const {
    customWorkDuration,
    customShortBreakDuration,
    customLongBreakDuration,
    setCustomWorkDuration,
    setCustomShortBreakDuration,
    setCustomLongBreakDuration,
  } = usePomodoroStore();

  const handleDurationChange = (
    setter: (value: number) => void,
    value: string,
  ) => {
    setter(Number(value) * 60);
  };

  return (
    <SettingsCard title="Pomodoro Settings">
      <form className="space-y-4">
        <div>
          <Label htmlFor="work-duration">Work Duration (minutes)</Label>
          <Input
            id="work-duration"
            type="number"
            value={customWorkDuration / 60}
            onChange={(e) =>
              handleDurationChange(setCustomWorkDuration, e.target.value)
            }
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="short-break-duration">
            Short Break Duration (minutes)
          </Label>
          <Input
            id="short-break-duration"
            type="number"
            value={customShortBreakDuration / 60}
            onChange={(e) =>
              handleDurationChange(setCustomShortBreakDuration, e.target.value)
            }
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="long-break-duration">
            Long Break Duration (minutes)
          </Label>
          <Input
            id="long-break-duration"
            type="number"
            value={customLongBreakDuration / 60}
            onChange={(e) =>
              handleDurationChange(setCustomLongBreakDuration, e.target.value)
            }
            min={1}
          />
        </div>
      </form>
    </SettingsCard>
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
    <SettingsCard title="Shortcut Settings">
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
    </SettingsCard>
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
    <div className="flex flex-row h-full w-full">
      <SettingsSidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <div className="flex-grow overflow-hidden h-full">{renderContent()}</div>
    </div>
  );
}
