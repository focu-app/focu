"use client";
import { CommandMenu } from "@/app/_components/CommandMenu";
import OnboardingStepper from "@/app/_components/OnboardingStepper";
import { SettingsDialog } from "@/app/_components/SettingsDialog";
import { useOllamaStore } from "@/app/store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckIn } from "../_components/CheckIn";
import { IconSidebar } from "./_components/IconSidebar";
import { ChatSidebar } from "./chat/_components/ChatSidebar";
import { useChatStore } from "../store/chatStore";
import { NewChatDialog } from "./chat/_components/NewChatDialog";
import { usePathname } from "next/navigation";

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
  const { isNewChatDialogOpen, setNewChatDialogOpen } = useChatStore();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      // in case we
      // document.addEventListener(
      //   "selectstart",
      //   (e) => {
      //     e.preventDefault();
      //     return false;
      //   },
      //   { capture: true },
      // );
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

  useEffect(() => {
    const shortcuts = [
      { key: "k", action: () => setIsCommandMenuOpen((open) => !open) },
      { key: ",", action: () => setIsSettingsOpen(true) },
    ];

    const handleKeyPress = (event: KeyboardEvent) => {
      console.log("event", event);
      console.log("isNewChatDialogOpen", isNewChatDialogOpen);
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
        } else if (isNewChatDialogOpen) {
          setNewChatDialogOpen(false);
        } else {
          closeMainWindow();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    closeMainWindow,
    isCommandMenuOpen,
    isSettingsOpen,
    isNewChatDialogOpen,
    setIsSettingsOpen,
    setNewChatDialogOpen,
  ]);

  const pathname = usePathname();
  const showChatSidebar = pathname.startsWith("/chat");

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
            <IconSidebar />
            {showChatSidebar && <ChatSidebar />}
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </div>
      </div>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <CommandMenu open={isCommandMenuOpen} setOpen={setIsCommandMenuOpen} />
      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
      />
      <CheckIn />
    </>
  );
}
