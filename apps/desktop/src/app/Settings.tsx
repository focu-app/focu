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
  onModelChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onModelChange: () => void;
}) {
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [pullProgress, setPullProgress] = useState<{ [key: string]: number }>(
    {},
  );
  const [isPulling, setIsPulling] = useState<{ [key: string]: boolean }>({});
  const streamRef = useRef<{ [key: string]: any }>({});

  const availableModels = ["llama3.1:latest", "ajindal/llama3.1-storm:8b"];

  useEffect(() => {
    if (isOpen) {
      fetchInstalledModels();
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
      onModelChange();
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
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
