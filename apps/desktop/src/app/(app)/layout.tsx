"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import OnboardingStepper from "@/app/_components/OnboardingStepper";
import { SettingsDialog } from "@/app/_components/SettingsDialog";
import { useOllamaStore } from "@/app/store";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { CheckIn } from "../_components/CheckIn";
import { Sidebar } from "./_components/Sidebar";
import { StatusFooter } from "./_components/StatusFooter";
import { useChatStore } from "../store/chatStore";
import { NewChatDialog } from "./chat/_components/NewChatDialog";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { useTaskStore } from "../store/taskStore";
import { usePathname } from "next/navigation";
import { useShortcuts, type ShortcutConfig } from "../_config/shortcuts";
import { ShortcutDialog } from "../_components/ShortcutDialog";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
    closeMainWindow,
    onboardingCompleted,
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
  } = useOllamaStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen, toggleSidebar } =
    useChatStore();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showTaskInput, setShowTaskInput } = useTaskStore();
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

  const closeAllDialogs = useCallback(() => {
    if (isCommandMenuOpen) setIsCommandMenuOpen(false);
    else if (isSettingsOpen) setIsSettingsOpen(false);
    else if (isNewChatDialogOpen) setNewChatDialogOpen(false);
    else if (showTaskInput) setShowTaskInput(false);
    else if (isShortcutDialogOpen) setIsShortcutDialogOpen(false);
    else closeMainWindow();
  }, [
    isCommandMenuOpen,
    isSettingsOpen,
    isNewChatDialogOpen,
    showTaskInput,
    isShortcutDialogOpen,
    closeMainWindow,
    setIsSettingsOpen,
    setNewChatDialogOpen,
    setShowTaskInput,
    setIsShortcutDialogOpen,
  ]);

  const shortcutMap = useMemo(() => {
    const map: Record<string, ShortcutConfig["action"]> = {};
    for (const shortcut of shortcuts) {
      map[shortcut.key] = shortcut.action;
    }
    map["cmd+k"] = () => setIsCommandMenuOpen((prev) => !prev);
    map["escape"] = closeAllDialogs;
    map["cmd+/"] = () => setIsShortcutDialogOpen(true);
    return map;
  }, [
    shortcuts,
    setIsCommandMenuOpen,
    closeAllDialogs,
    setIsShortcutDialogOpen,
  ]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = `${event.metaKey || event.ctrlKey ? "cmd+" : ""}${event.key.toLowerCase()}`;
      const action = shortcutMap[key];
      if (action) {
        event.preventDefault();
        action();
      }
    },
    [shortcutMap],
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
