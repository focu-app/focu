"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { openSettingsWindow } from "./_components/AppDropdownMenu";
import { CommandMenu } from "./_components/CommandMenu";
import Chat from "./chat";
import { useOllamaStoreShallow } from "./store";

export default function Ollama() {
  const {
    activeModel,
    isModelLoading,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
  } = useOllamaStoreShallow();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    const { invoke } = await import("@tauri-apps/api/tauri");

    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
  }, []);

  const shortcuts = useMemo(
    () => [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: openSettingsWindow },
    ],
    [],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.key === event.key && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          shortcut.action();
        }
      }

      if (event.key === "Escape") {
        if (isCommandMenuOpen) {
          setIsCommandMenuOpen(false);
        } else {
          closeMainWindow();
        }
      }
    },
    [closeMainWindow, isCommandMenuOpen, shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    console.log("ollama.tsx useEffect");
    initializeApp();
    registerGlobalShortcut();

    return () => {
      unregisterGlobalShortcut();
    };
  }, [initializeApp, registerGlobalShortcut, unregisterGlobalShortcut]);

  console.log("isCommandMenuOpen", isCommandMenuOpen);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {isModelLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-lg text-gray-500">Loading...</p>
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
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
    </div>
  );
}
