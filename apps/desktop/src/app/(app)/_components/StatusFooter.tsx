"use client";

import { Button } from "@repo/ui/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { useOllamaStore } from "@/app/store";

export function StatusFooter() {
  const { setIsSettingsOpen } = useOllamaStore();

  return (
    <footer className="h-8 border-t flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">
        {/* Add any status information here */}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSettingsOpen(true)}
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>
    </footer>
  );
}
