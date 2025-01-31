"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import { SettingsDialog } from "@/app/_components/settings/SettingsDialog";
import { useOllamaStore } from "@/app/store/ollamaStore";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckIn } from "../_components/CheckIn";
import { LicenseKeyDialog } from "../_components/LicenseKeyDialog";
import { ShortcutDialog } from "../_components/shortcuts/ShortcutDialog";
import { Sidebar } from "../_components/Sidebar";
import { StatusFooter } from "../_components/StatusFooter";
import { Updater } from "../_components/Updater";
import { Shortcuts } from "../_components/shortcuts/Shortcuts";
import { useChatStore } from "../store/chatStore";
import { NewChatDialog } from "@/app/_components/chat/NewChatDialog";

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
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
    isCommandMenuOpen,
    setIsCommandMenuOpen,
  } = useOllamaStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const disableMenu = () => {
      if (process.env.NODE_ENV === "development") return;
      document.addEventListener("contextmenu", (e) => {
        const target = e.target as HTMLElement;
        const hasAllowContextMenu = target.closest(
          '[data-allow-context-menu="true"]',
        );

        if (!hasAllowContextMenu) {
          e.preventDefault();
        }
      });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Shortcuts />
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
