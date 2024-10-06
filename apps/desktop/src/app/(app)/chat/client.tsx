"use client";

import { SettingsDialog } from "@/app/_components/SettingsDialog";
import Chat from "./_components/Chat";
import { useOllamaStore } from "@/app/store";
import { CommandMenu } from "@/app/_components/CommandMenu";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ChatClient() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
    closeMainWindow,
  } = useOllamaStore();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initializeApp();
      await registerGlobalShortcut();
      setIsLoading(false);
    };

    init();

    return () => {
      unregisterGlobalShortcut();
    };
  }, [initializeApp, registerGlobalShortcut, unregisterGlobalShortcut]);

  const shortcuts = [
    { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
    { key: ",", action: () => setIsSettingsOpen(true) },
  ];

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
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else {
          closeMainWindow();
        }
      }
    },
    [closeMainWindow, isCommandMenuOpen, isSettingsOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Chat />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
    </>
  );
}
