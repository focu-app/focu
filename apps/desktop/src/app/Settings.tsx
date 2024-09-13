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

  useEffect(() => {
    if (isOpen) {
      fetchInstalledModels();
      fetchActiveModel();
    }
  }, [isOpen, fetchInstalledModels, fetchActiveModel]);

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
                const isActive = model === activeModel;

                return (
                  <TableRow key={model}>
                    <TableCell>{model}</TableCell>
                    <TableCell>{isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
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
