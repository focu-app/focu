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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

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
    isOllamaRunning,
    fetchInstalledModels,
    fetchActiveModel,
    pullModel,
    stopPull,
    activateModel,
    checkOllamaStatus,
  } = useOllamaStore();

  const availableModels = ["llama3.1:latest", "ajindal/llama3.1-storm:8b"];

  const refreshData = useCallback(() => {
    checkOllamaStatus();
    fetchInstalledModels();
    fetchActiveModel();
  }, [checkOllamaStatus, fetchInstalledModels, fetchActiveModel]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ollama Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Ollama Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-lg font-semibold ${isOllamaRunning ? "text-green-600" : "text-red-600"}`}
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
                                  isPulling[model]
                                    ? stopPull(model)
                                    : pullModel(model)
                                }
                                variant={
                                  isPulling[model] ? "destructive" : "default"
                                }
                                size="sm"
                                className="w-20"
                              >
                                {isPulling[model] ? "Stop" : "Install"}
                              </Button>
                              <div
                                className={`ml-2 flex items-center ${isPulling[model] ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
                              >
                                <Progress
                                  value={pullProgress[model] || 0}
                                  className="w-[100px] mr-2"
                                />
                                <span className="text-sm w-12">
                                  {Math.round(pullProgress[model] || 0)}%
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
