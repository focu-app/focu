"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import { SettingsDialog } from "@/app/_components/settings/SettingsDialog";
import { useOllamaStore } from "@/app/store";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIn } from "../_components/CheckIn";
import { LicenseKeyDialog } from "../_components/LicenseKeyDialog";
import { ShortcutDialog } from "../_components/ShortcutDialog";
import { type ShortcutConfig, useShortcuts } from "../_config/shortcuts";
import { useChatStore } from "../store/chatStore";
import { Sidebar } from "./_components/Sidebar";
import { StatusFooter } from "./_components/StatusFooter";
import { NewChatDialog } from "./chat/_components/NewChatDialog";
import { Updater } from "../_components/Updater";

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
  const [isLoading, setIsLoading] = useState(true);
  const shortcuts = useShortcuts();
  const pathname = usePathname();

  const currentPageShortcuts = useMemo(() => {
    if (pathname.startsWith("/chat")) {
      return shortcuts.filter((s) => s.context === "chat" || !s.context);
    }

    if (pathname.startsWith("/focus")) {
      return shortcuts.filter((s) => s.context === "focus" || !s.context);
    }
    return shortcuts.filter((s) => s.context === "global");
  }, [shortcuts, pathname]);

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

      // First, check for page-specific shortcuts
      const pageSpecificShortcut = currentPageShortcuts.find(
        (s) => s.key === key && s.context !== "global",
      );
      if (pageSpecificShortcut) {
        event.preventDefault();
        pageSpecificShortcut.action();
        return;
      }

      // If no page-specific shortcut found, check for global shortcuts
      const globalShortcut = shortcuts.find(
        (s) => s.key === key && s.context === "global",
      );
      if (globalShortcut) {
        event.preventDefault();
        globalShortcut.action();
      }
    },
    [shortcuts, currentPageShortcuts],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen w-full">
        <div className="flex flex-1 overflow-hidden text-foreground">
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
      <LicenseKeyDialog />
      <Updater />
    </TooltipProvider>
  );
}
