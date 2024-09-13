import { useEffect, useCallback } from "react";
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
import { useOllamaStore } from "./store";

export function Settings({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    installedModels,
    activeModel,
    pullProgress,
    isPulling,
    fetchInstalledModels,
    fetchActiveModel,
    pullModel,
    stopPull,
    activateModel,
  } = useOllamaStore();

  const availableModels = ["llama3.1:latest", "ajindal/llama3.1-storm:8b"];

  const refreshData = useCallback(() => {
    fetchInstalledModels();
    fetchActiveModel();
  }, [fetchInstalledModels, fetchActiveModel]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ollama Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 overflow-y-auto">
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
                const isActive = model === activeModel;
                return (
                  <TableRow key={model}>
                    <TableCell className="w-1/3">{model}</TableCell>
                    <TableCell className="w-1/3">
                      {isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="w-1/3">
                      <Button
                        onClick={() => activateModel(model)}
                        variant={isActive ? "secondary" : "default"}
                        size="sm"
                        disabled={isActive}
                      >
                        {isActive ? "Selected" : "Select"}
                      </Button>
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
                  const isModelPulling = isPulling[model] || false;
                  const progress = pullProgress[model] || 0;
                  return (
                    <TableRow key={model}>
                      <TableCell className="w-1/3">{model}</TableCell>
                      <TableCell className="w-1/3">
                        {isInstalled ? "Installed" : "Not Installed"}
                      </TableCell>
                      <TableCell className="w-1/3">
                        <div className="flex items-center h-10">
                          {!isInstalled ? (
                            <>
                              <Button
                                onClick={() =>
                                  isModelPulling
                                    ? stopPull(model)
                                    : pullModel(model)
                                }
                                variant={
                                  isModelPulling ? "destructive" : "default"
                                }
                                size="sm"
                                className="w-20"
                              >
                                {isModelPulling ? "Stop" : "Install"}
                              </Button>
                              <div
                                className={`ml-2 flex items-center ${isModelPulling ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
                              >
                                <Progress
                                  value={progress}
                                  className="w-[100px] mr-2"
                                />
                                <span className="text-sm w-12">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-green-600">Ready</span>
                          )}
                        </div>
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
