"use client";

import { useState } from "react";
import Chat from "./chat";
import { Button } from "@repo/ui/components/ui/button";
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
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

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
              Select a model in Settings to start chatting
            </p>
          </div>
        )}
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        onModelSelect={setSelectedModel}
      />
    </div>
  );
}
