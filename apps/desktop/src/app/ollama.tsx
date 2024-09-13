"use client";

import { useState, useEffect } from "react";
import Chat from "./chat";
import { Button } from "@repo/ui/components/ui/button";
import { Settings } from "./Settings";
import ollama from "ollama/browser";

export default function Ollama({
  isSettingsOpen,
  onOpenSettings,
  onCloseSettings,
}: {
  isSettingsOpen: boolean;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
}) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveModel();
  }, []);

  async function fetchActiveModel() {
    try {
      const models = await ollama.ps();
      if (models.models.length > 0) {
        setSelectedModel(models.models[0].model);
      }
    } catch (error) {
      console.error("Error fetching active model:", error);
    }
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ollama Chat</h1>
        <Button onClick={onOpenSettings}>Settings</Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedModel ? (
          <Chat model={selectedModel} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">
              No model is currently active. Please select a model in Settings to
              start chatting.
            </p>
          </div>
        )}
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        onModelSelect={setSelectedModel}
        currentModel={selectedModel}
      />
    </div>
  );
}
