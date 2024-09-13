"use client";

import { useState } from "react";
import Ollama from "./ollama";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <Ollama
        isSettingsOpen={isSettingsOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCloseSettings={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
