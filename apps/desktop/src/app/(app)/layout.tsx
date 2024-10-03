"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { CommandMenu } from "../_components/CommandMenu";
import { ChatSidebar } from "../_components/ChatSidebar";
import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { SettingsDialog } from "../_components/SettingsDialog";
import { CheckIn } from "../_components/CheckIn";
import OnboardingStepper from "../_components/OnboardingStepper";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {
    initializeApp,
    registerGlobalShortcut,
    unregisterGlobalShortcut,
    isSettingsOpen,
    setIsSettingsOpen,
    isCheckInOpen,
    setIsCheckInOpen,
    onboardingCompleted,
    setShowTasks,
  } = useOllamaStore();
  const { setCurrentChat } = useChatStore();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    const { invoke } = await import("@tauri-apps/api/tauri");

    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, [setIsSettingsOpen]);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, [setIsSettingsOpen]);

  const handleCloseCheckIn = useCallback(() => {
    setIsCheckInOpen(false);
  }, [setIsCheckInOpen]);

  const shortcuts = [
    { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
    { key: ",", action: handleOpenSettings },
    { key: "f", action: () => setShowTasks(true) },
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
          handleCloseSettings();
        } else if (isCheckInOpen) {
          handleCloseCheckIn();
        } else {
          closeMainWindow();
        }
      }
    },
    [
      closeMainWindow,
      isCommandMenuOpen,
      isSettingsOpen,
      isCheckInOpen,
      handleCloseCheckIn,
      handleCloseSettings,
      shortcuts,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

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

  const handleSelectTasks = useCallback(() => {
    setShowTasks(true);
  }, [setShowTasks]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setCurrentChat(chatId);
      setShowTasks(false);
    },
    [setCurrentChat, setShowTasks],
  );

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
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden">
          <ChatSidebar
            onSelectTasks={handleSelectTasks}
            onSelectChat={handleSelectChat}
          />
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </div>
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <CheckIn />
    </div>
  );
}
