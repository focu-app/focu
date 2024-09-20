"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CommandMenu } from "../_components/CommandMenu";
import { ChatSidebar } from "../_components/ChatSidebar";
import { useOllamaStoreShallow } from "../store";
import { useChatStore } from "../store/chatStore";
import { SettingsDialog } from "../_components/SettingsDialog";

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
  } = useOllamaStoreShallow();
  const { setCurrentChat, setShowTasks } = useChatStore();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  const closeMainWindow = useCallback(async () => {
    const { WebviewWindow } = await import("@tauri-apps/api/window");
    const { invoke } = await import("@tauri-apps/api/tauri");

    await WebviewWindow.getByLabel("main")?.hide();
    await invoke("set_dock_icon_visibility", { visible: false });
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, [setIsSettingsOpen]);

  const shortcuts = useMemo(
    () => [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: handleOpenSettings },
    ],
    [setIsCommandMenuOpen, handleOpenSettings],
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
    [closeMainWindow, isCommandMenuOpen, shortcuts, setIsCommandMenuOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    initializeApp();
    registerGlobalShortcut();
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

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full w-full bg-white overflow-hidden">
          <ChatSidebar
            onSelectTasks={handleSelectTasks}
            onSelectChat={handleSelectChat}
          />
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </div>
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
