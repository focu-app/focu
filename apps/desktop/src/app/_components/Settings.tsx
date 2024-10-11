"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle"; // Import ModeToggle
import { useToast } from "@repo/ui/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { useOllamaStore } from "../store";
import { usePomodoroStore } from "../store/pomodoroStore";
import { ModelDownloadButton, modelOptions } from "./ModelManagement";
import { ShortcutInput } from "./ShortcutInput";

type Category = "General" | "AI" | "Pomodoro" | "Shortcuts";

const showSettingsSavedToast = (
  toast: ReturnType<typeof useToast>["toast"],
) => {
  toast({
    title: "Settings saved",
    duration: 3000,
  });
};

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
            variant={activeCategory === category ? "outline" : "ghost"}
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
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  const { setIsSettingsOpen } = useOllamaStore();

  const handleSave = () => {
    onSave();
    setIsSettingsOpen(false);
  };

  return (
    <Card className="h-full flex flex-col border-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-6 max-w-3xl">
        {children}
      </CardContent>
      <div className="p-6 flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Card>
  );
}

function GeneralSettings() {
  const { checkInInterval, setCheckInInterval, setIsSettingsOpen } =
    useOllamaStore();
  const { toast } = useToast();
  const [localInterval, setLocalInterval] = useState(
    checkInInterval / (60 * 1000),
  );

  const handleSave = () => {
    const newValue = Math.max(1, localInterval) * 60 * 1000;
    setCheckInInterval(newValue);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="General Settings" onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label>Theme</Label>
        <ModeToggle />
      </div>
      <form className="space-y-4">
        <div>
          <Label htmlFor="check-in-interval">Check-in Interval (minutes)</Label>
          <Input
            id="check-in-interval"
            type="number"
            value={localInterval}
            onChange={(e) => setLocalInterval(Number(e.target.value))}
            min={1}
          />
        </div>
      </form>
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
    checkOllamaStatus,
    activateModel,
  } = useOllamaStore();
  const { toast } = useToast();

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
  const { toast } = useToast();
  const [localWorkDuration, setLocalWorkDuration] = useState(
    customWorkDuration / 60,
  );
  const [localShortBreakDuration, setLocalShortBreakDuration] = useState(
    customShortBreakDuration / 60,
  );
  const [localLongBreakDuration, setLocalLongBreakDuration] = useState(
    customLongBreakDuration / 60,
  );

  const handleSave = () => {
    setCustomWorkDuration(Math.max(1, localWorkDuration) * 60);
    setCustomShortBreakDuration(Math.max(1, localShortBreakDuration) * 60);
    setCustomLongBreakDuration(Math.max(1, localLongBreakDuration) * 60);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="Pomodoro Settings" onSave={handleSave}>
      <form className="space-y-4">
        <div>
          <Label htmlFor="work-duration">Work Duration (minutes)</Label>
          <Input
            id="work-duration"
            type="number"
            value={localWorkDuration}
            onChange={(e) => setLocalWorkDuration(Number(e.target.value))}
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
            value={localShortBreakDuration}
            onChange={(e) => setLocalShortBreakDuration(Number(e.target.value))}
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
            value={localLongBreakDuration}
            onChange={(e) => setLocalLongBreakDuration(Number(e.target.value))}
            min={1}
          />
        </div>
      </form>
    </SettingsCard>
  );
}

function ShortcutSettings() {
  const { globalShortcut, setGlobalShortcut } = useOllamaStore();
  const { toast } = useToast();
  const [localShortcut, setLocalShortcut] = useState(globalShortcut);

  const handleSave = async () => {
    try {
      await setGlobalShortcut(localShortcut);
      showSettingsSavedToast(toast);
    } catch (error) {
      console.error("Failed to set global shortcut:", error);
      toast({
        title: "Error",
        description: "Failed to set global shortcut. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleResetToDefault = async () => {
    const defaultShortcut = "Command+Shift+I";
    setLocalShortcut(defaultShortcut);
    try {
      await setGlobalShortcut(defaultShortcut);
      showSettingsSavedToast(toast);
    } catch (error) {
      console.error("Failed to reset global shortcut:", error);
      toast({
        title: "Error",
        description: "Failed to reset global shortcut. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <SettingsCard title="Shortcut Settings" onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="global-shortcut">Open Focu</Label>
        <div className="flex items-center gap-2">
          <ShortcutInput
            key={localShortcut} // Add this line
            value={localShortcut}
            onChange={setLocalShortcut}
          />
          <Button onClick={handleResetToDefault} size="sm">
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
