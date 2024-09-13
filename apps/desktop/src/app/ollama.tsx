"use client";

import { useState, useEffect } from "react";
import Chat from "./chat";
import { Button } from "@repo/ui/components/ui/button";
import { Settings } from "./Settings";
import { useOllamaStore } from "./store";
import { Command } from "@tauri-apps/api/shell";

export default function Ollama() {
  const { selectedModel, activeModel, fetchActiveModel, initializeApp } =
    useOllamaStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    initializeApp();
    fetchActiveModel();

    async function startOllama() {
      const command = Command.sidecar("binaries/ollama-darwin", ["serve"]);
      const child = await command.spawn();
      console.log(child);
      command.on("close", (data) => {
        console.log(
          `command finished with code ${data.code} and signal ${data.signal}`,
        );
      });
      command.on("error", (error) =>
        console.error(`command error: "${error}"`),
      );
      command.stdout.on("data", (line) =>
        console.log(`command stdout: "${line}"`),
      );
      command.stderr.on("data", (line) =>
        console.log(`command stderr: "${line}"`),
      );
    }
    startOllama();
  }, [initializeApp, fetchActiveModel]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ollama Chat</h1>
        <Button onClick={() => setIsSettingsOpen(true)}>Settings</Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeModel ? (
          <Chat model={activeModel} />
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
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
