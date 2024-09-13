import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Progress } from "@repo/ui/components/ui/progress";
import ollama from "ollama/browser";

export function Settings({
  isOpen,
  onClose,
  onModelSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onModelSelect: (model: string) => void;
}) {
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [runningModels, setRunningModels] = useState<any[]>([]);
  const [pullProgress, setPullProgress] = useState<{ [key: string]: number }>(
    {},
  );
  const [isPulling, setIsPulling] = useState<{ [key: string]: boolean }>({});
  const streamRef = useRef<{ [key: string]: any }>({});

  const availableModels = ["llama3.1:latest", "ajindal/llama3.1-storm:8b"];

  useEffect(() => {
    if (isOpen) {
      fetchInstalledModels();
      fetchRunningModels();
    }
  }, [isOpen]);

  async function fetchInstalledModels() {
    try {
      const models = await ollama.list();
      setInstalledModels(models.models.map((model) => model.name));
    } catch (error) {
      console.error("Error fetching installed models:", error);
    }
  }

  async function fetchRunningModels() {
    try {
      const models = await ollama.ps();
      setRunningModels(models.models);
    } catch (error) {
      console.error("Error fetching running models:", error);
    }
  }

  async function pullModel(model: string) {
    setIsPulling((prev) => ({ ...prev, [model]: true }));
    setPullProgress((prev) => ({ ...prev, [model]: 0 }));

    try {
      streamRef.current[model] = await ollama.pull({ model, stream: true });

      for await (const chunk of streamRef.current[model]) {
        if ("total" in chunk && "completed" in chunk) {
          const percentage = Math.round((chunk.completed / chunk.total) * 100);
          setPullProgress((prev) => ({ ...prev, [model]: percentage }));
        }
      }

      await fetchInstalledModels();
    } catch (error) {
      console.error(`Error pulling model ${model}:`, error);
    } finally {
      setIsPulling((prev) => ({ ...prev, [model]: false }));
    }
  }

  function stopPull(model: string) {
    if (streamRef.current[model]) {
      streamRef.current[model].abort();
    }
    setIsPulling((prev) => ({ ...prev, [model]: false }));
    setPullProgress((prev) => ({ ...prev, [model]: 0 }));
  }

  async function toggleModel(model: string) {
    const isRunning = runningModels.some((m) => m.model === model);
    if (isRunning) {
      await unloadModel(model);
    } else {
      await preloadModel(model);
    }
  }

  async function preloadModel(model: string) {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          keep_alive: "5m",
          options: { num_ctx: 4096 },
        }),
      });
      const data = await response.json();
      await fetchRunningModels();
      console.log(`${model} preload response:`, data);
    } catch (error) {
      console.error(`Error preloading ${model}:`, error);
    }
  }

  async function unloadModel(model: string) {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, keep_alive: 0 }),
      });
      const data = await response.json();
      setTimeout(() => {
        fetchRunningModels();
      }, 1000);
      console.log(`${model} unload response:`, data);
    } catch (error) {
      console.error(`Error unloading ${model}:`, error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ollama Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installedModels.map((model) => {
                const isRunning = runningModels.some((m) => m.model === model);

                return (
                  <TableRow key={model}>
                    <TableCell>{model}</TableCell>
                    <TableCell>{isRunning ? "Running" : "Stopped"}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => toggleModel(model)}
                        variant={isRunning ? "destructive" : "default"}
                        size="sm"
                        className="mr-2"
                      >
                        {isRunning ? "Stop" : "Start"}
                      </Button>
                      {isRunning && (
                        <Button
                          onClick={() => {
                            onModelSelect(model);
                            onClose();
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          Select
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Available Models</h3>
            <Table>
              <TableBody>
                {availableModels.map((model) => {
                  const isInstalled = installedModels.includes(model);

                  return (
                    <TableRow key={model}>
                      <TableCell>{model}</TableCell>
                      <TableCell>
                        {isInstalled ? "Installed" : "Not Installed"}
                      </TableCell>
                      <TableCell>
                        {!isInstalled ? (
                          <>
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
                              className="mr-2"
                            >
                              {isPulling[model] ? "Stop" : "Install"}
                            </Button>
                            {isPulling[model] && (
                              <Progress
                                value={pullProgress[model]}
                                className="w-[100px]"
                              />
                            )}
                          </>
                        ) : (
                          <span className="text-green-600">Ready</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
