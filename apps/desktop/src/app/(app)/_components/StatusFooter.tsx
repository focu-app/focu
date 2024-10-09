"use client";

import { Button } from "@repo/ui/components/ui/button";
import { SettingsIcon } from "lucide-react";
import { useOllamaStore } from "@/app/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

export function StatusFooter() {
  const { setIsSettingsOpen } = useOllamaStore();

  return (
    <footer className="h-8 border-t flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">Focu v0.1.0</div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsSettingsOpen(true)}
          >
            <SettingsIcon className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
    </footer>
  );
}
