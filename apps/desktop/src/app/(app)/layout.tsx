"use client";
import { CommandMenu } from "@/components/CommandMenu";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { useOllamaStore } from "@/store/ollamaStore";
import { useAppStore } from "@/store/appStore";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { StatusFooter } from "../../components/StatusFooter";
import { Updater } from "../../components/Updater";
import { CheckInDialog } from "../../components/check-in/CheckInDialog";
import { LicenseKeyDialog } from "../../components/license-key/LicenseKeyDialog";
import { ShortcutDialog } from "../../components/shortcuts/ShortcutDialog";
import { Shortcuts } from "../../components/shortcuts/Shortcuts";
import { useChatStore } from "../../store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
    isCommandMenuOpen,
    setIsCommandMenuOpen,
  } = useOllamaStore();
  const { initializeApp, registerGlobalShortcut, unregisterGlobalShortcut } =
    useAppStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const { isSettingsOpen, setIsSettingsOpen } = useSettingsStore();

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
      <CheckInDialog />
      <ShortcutDialog
        open={isShortcutDialogOpen}
        onOpenChange={setIsShortcutDialogOpen}
      />
      <LicenseKeyDialog />
      <Updater />
    </TooltipProvider>
  );
}
