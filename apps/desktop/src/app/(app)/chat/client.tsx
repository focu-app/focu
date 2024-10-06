"use client";

import { SettingsDialog } from "@/app/_components/SettingsDialog";
import Chat from "./_components/Chat";
import { useOllamaStore } from "@/app/store";

export default function ChatClient() {
  const { isSettingsOpen, setIsSettingsOpen } = useOllamaStore();
  return (
    <>
      <Chat />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
