"use client";

import { useState, useEffect } from "react";
import ollama from "ollama/browser";
import Chat from "./chat";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Settings } from "./Settings";

export default function Ollama({
  isSettingsOpen,
  onOpenSettings,
  onCloseSettings,
}: {
  isSettingsOpen: boolean;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
}) {
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [runningModels, setRunningModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    fetchInstalledModels();
    fetchRunningModels();
  }, []);

  async function fetchInstalledModels() {
    try {
      const models = await ollama.list();
      setInstalledModels(models.models.map((model) => model.name));
    } catch (error) {
      console.error("Error fetching installed models:", error);
      setInstalledModels([]);
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

  async function reloadData() {
    await Promise.all([fetchInstalledModels(), fetchRunningModels()]);
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ollama Model Management</h1>
        <Button onClick={onOpenSettings}>Settings</Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 overflow-auto border-r">
          <div className="p-4">
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
                  const isRunning = runningModels.some(
                    (m) => m.model === model,
                  );

                  return (
                    <TableRow key={model}>
                      <TableCell>{model}</TableCell>
                      <TableCell>{isRunning ? "Running" : "Stopped"}</TableCell>
                      <TableCell>
                        {isRunning && (
                          <Button
                            onClick={() => setSelectedModel(model)}
                            variant="secondary"
                            size="sm"
                          >
                            Chat
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="p-4">
            <Button onClick={reloadData} className="w-full" variant="outline">
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedModel ? (
            <Chat model={selectedModel} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">
                Select a model to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        onModelChange={reloadData}
      />
    </div>
  );
}
