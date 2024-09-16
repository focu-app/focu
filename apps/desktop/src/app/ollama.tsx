"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useOllamaStore } from "./store";
import { Loader2 } from "lucide-react";
import { invoke } from "@tauri-apps/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { exit } from "@tauri-apps/api/process";

export default function Ollama() {
  const { selectedModel, activeModel, isModelLoading, initializeApp } =
    useOllamaStore();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  console.log("activeModel", activeModel);

  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
  }, []);

  const openSettingsWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    await WebviewWindow.getByLabel("settings")?.show();
  }, []);

  const quitApp = useCallback(async () => {
    console.log("quitting app");
    await exit(0);
  }, []);

  useEffect(() => {
    initializeApp();

    async function checkIn() {
      const unlisten = await listen("check-in", (event) => {
        setIsCheckInOpen(true);
      });
      return () => {
        unlisten();
      };
    }
    checkIn();

    // Add event listener for Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMainWindow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [initializeApp, closeMainWindow]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ollama Chat</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openSettingsWindow}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={quitApp}>Quit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-hidden">
        {isModelLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-lg text-gray-500">Loading model...</p>
          </div>
        ) : activeModel ? (
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
