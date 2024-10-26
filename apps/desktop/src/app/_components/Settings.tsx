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
import { ModelDownloadButton } from "./ModelManagement";
import { ShortcutInput } from "./ShortcutInput";
import StartOllamaButton from "./StartOllamaButton";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/components/ui/dialog";
import { Templates } from "./Templates";
import { useLicenseStore } from "../store/licenseStore";
import { useChatStore, ThrottleSpeed } from "../store/chatStore";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";

type Category = "General" | "AI" | "Pomodoro" | "Shortcuts" | "Templates";

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
  const categories: Category[] = [
    "General",
    "AI",
    "Pomodoro",
    "Shortcuts",
    "Templates",
  ];

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
  const { checkInInterval, setCheckInInterval } = useOllamaStore();
  const {
    throttleResponse,
    setThrottleResponse,
    throttleSpeed,
    setThrottleSpeed,
  } = useChatStore();
  const { toast } = useToast();
  const [localInterval, setLocalInterval] = useState(
    checkInInterval / (60 * 1000),
  );
  const [localThrottleSpeed, setLocalThrottleSpeed] =
    useState<ThrottleSpeed>(throttleSpeed);

  const handleSave = () => {
    const newValue = Math.max(1, localInterval) * 60 * 1000;
    setCheckInInterval(newValue);
    setThrottleSpeed(localThrottleSpeed);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="General Settings" onSave={handleSave}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Theme</Label>
          <ModeToggle />
        </div>
        <form className="space-y-4">
          <div>
            <Label htmlFor="check-in-interval">
              Check-in Interval (minutes)
            </Label>
            <Input
              id="check-in-interval"
              type="number"
              value={localInterval}
              onChange={(e) => setLocalInterval(Number(e.target.value))}
              min={1}
            />
          </div>
        </form>
        <div className="flex flex-col gap-4">
          <Label htmlFor="throttle-response">Throttle AI Response</Label>
          <Switch
            id="throttle-response"
            checked={throttleResponse}
            onCheckedChange={setThrottleResponse}
          />
        </div>
        {throttleResponse && (
          <div className="flex flex-col gap-2">
            <Label>Throttle Speed</Label>
            <RadioGroup
              value={localThrottleSpeed}
              onValueChange={(value) =>
                setLocalThrottleSpeed(value as ThrottleSpeed)
              }
            >
              {["slow", "medium", "fast"].map((speed) => (
                <div key={speed} className="flex items-center space-x-2">
                  <RadioGroupItem value={speed} id={speed} />
                  <Label htmlFor={speed} className="capitalize">
                    {speed}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>
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
    modelOptions,
    addModelOption,
    removeModelOption,
  } = useOllamaStore();
  const { toast } = useToast();
  const [newModelName, setNewModelName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modelNameError, setModelNameError] = useState<string | null>(null);

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
    const isValidModelName = /^[a-z0-9.]+(-[a-z0-9.]+)?(:[a-z0-9.]+)?$/.test(
      trimmedModelName,
    );

    if (trimmedModelName && isValidModelName) {
      // Check for duplicates
      if (modelOptions.some((model) => model.name === trimmedModelName)) {
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
    const isDefaultModel = [
      "ajindal/llama3.1-storm:8b",
      "llama3.2:latest",
      "llama3.1:latest",
    ].includes(modelName);

    if (isDefaultModel) {
      toast({
        title: "Cannot remove default model",
        description: "This is a default model and cannot be removed.",
        duration: 3000,
      });
    } else {
      removeModelOption(modelName);
      toast({
        title: "Model removed",
        description: "The model has been removed from the list.",
        duration: 3000,
      });
    }
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
        <div className="flex flex-row gap-2">
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Ollama is not running.
          </p>
          <StartOllamaButton />
        </div>
      )}
      {isOllamaRunning && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelOptions.map((model) => {
                const isInstalled = installedModels.includes(model.name);
                const isDefaultModel = [
                  "ajindal/llama3.1-storm:8b",
                  "llama3.2:latest",
                  "llama3.1:latest",
                ].includes(model.name);
                return (
                  <TableRow key={model.name}>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>{model.size}</TableCell>
                    <TableCell>
                      {isInstalled ? "Installed" : "Not Installed"}
                    </TableCell>
                    <TableCell className="w-[160px]">
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
                    <TableCell>
                      {!isDefaultModel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModel(model.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
        </>
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
  const { instanceId } = useLicenseStore();
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
      case "Templates":
        return <Templates />;
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
