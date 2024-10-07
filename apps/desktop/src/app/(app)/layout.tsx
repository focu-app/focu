"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import OnboardingStepper from "@/app/_components/OnboardingStepper";
import { SettingsDialog } from "@/app/_components/SettingsDialog";
import { useOllamaStore } from "@/app/store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckIn } from "../_components/CheckIn";
import { Sidebar } from "./chat/_components/Sidebar";

export default function ChatLayout({
  children,
}: { children: React.ReactNode }) {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
    closeMainWindow,
    onboardingCompleted,
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

  useEffect(() => {
    const shortcuts = [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: () => setIsSettingsOpen(true) },
    ];

    const handleKeyPress = (event: KeyboardEvent) => {
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
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [closeMainWindow, isCommandMenuOpen, isSettingsOpen, setIsSettingsOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <OnboardingStepper />;
  }

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full w-full overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
      <CheckIn />
    </>
  );
}
