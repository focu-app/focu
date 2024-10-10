"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import OnboardingStepper from "@/app/_components/OnboardingStepper";
import { SettingsDialog } from "@/app/_components/SettingsDialog";
import { useOllamaStore } from "@/app/store";
import { Loader2 } from "lucide-react";
import { useEffect, useCallback, useMemo, useState } from "react";
import { CheckIn } from "../_components/CheckIn";
import { Sidebar } from "./_components/Sidebar";
import { StatusFooter } from "./_components/StatusFooter";
import { useChatStore } from "../store/chatStore";
import { NewChatDialog } from "./chat/_components/NewChatDialog";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { useShortcuts, type ShortcutConfig } from "../_config/shortcuts";
import { ShortcutDialog } from "../_components/ShortcutDialog";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
    onboardingCompleted,
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
    isCommandMenuOpen,
    setIsCommandMenuOpen,
  } = useOllamaStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const shortcuts = useShortcuts();

  useEffect(() => {
    const disableMenu = () => {
      if (process.env.NODE_ENV === "development") return;

      document.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          return false;
        },
        { capture: true },
      );
    };
    const init = async () => {
      setIsLoading(true);
      await initializeApp();
      await registerGlobalShortcut();
      setIsLoading(false);
    };

    init();
    disableMenu();

    return () => {
      unregisterGlobalShortcut();
    };
  }, [initializeApp, registerGlobalShortcut, unregisterGlobalShortcut]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = `${event.metaKey || event.ctrlKey ? "cmd+" : ""}${event.key.toLowerCase()}`;
      const shortcut = shortcuts.find((s) => s.key === key);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts],
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

  if (!onboardingCompleted) {
    return <OnboardingStepper />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
        <StatusFooter />
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
      />
      <CheckIn />
      <ShortcutDialog
        open={isShortcutDialogOpen}
        onOpenChange={setIsShortcutDialogOpen}
      />
    </TooltipProvider>
  );
}
