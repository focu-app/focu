"use client";

import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import Chat from "./chat";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Settings } from "./Settings";
import { useOllamaStore } from "./store";

export default function Ollama() {
  const { selectedModel, activeModel, fetchActiveModel, initializeApp } =
    useOllamaStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    initializeApp();
    fetchActiveModel();

    async function checkIn() {
      const unlisten = await listen("check-in", (event) => {
        setIsCheckInOpen(true);
      });
      return () => {
        unlisten();
      };
    }
    checkIn();
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

      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent className="w-[400px] max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Check-In</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              How are you doing today? Let us know if you need any assistance.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCheckInOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
