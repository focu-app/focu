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
import { AppDropdownMenu } from "./_components/AppDropdownMenu";
import { CommandMenu } from "./_components/CommandMenu";
import { openSettingsWindow } from "./_components/AppDropdownMenu";

export default function Ollama() {
  const { activeModel, isModelLoading, initializeApp } = useOllamaStore();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    const { invoke } = await import("@tauri-apps/api/tauri");

    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
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

    const shortcuts = [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: openSettingsWindow },
    ];

    const handleKeyPress = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.key === event.key && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          shortcut.action();
        }

        if (event.key === "Escape" && !isCommandMenuOpen) {
          closeMainWindow();
        } else if (event.key === "Escape" && isCommandMenuOpen) {
          setIsCommandMenuOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Clean up function
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [initializeApp, closeMainWindow, isCommandMenuOpen]);

  console.log("isCommandMenuOpen", isCommandMenuOpen);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
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
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
    </div>
  );
}
