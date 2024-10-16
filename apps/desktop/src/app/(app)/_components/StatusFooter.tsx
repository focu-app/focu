"use client";

import { Button } from "@repo/ui/components/ui/button";
import { KeyboardIcon, SettingsIcon } from "lucide-react";
import { useOllamaStore } from "@/app/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Kbd } from "@repo/ui/components/ui/kbd";
import packageJson from "../../../../package.json";

export function StatusFooter() {
  const { setIsSettingsOpen, setIsShortcutDialogOpen } = useOllamaStore();
  const version = packageJson.version;

  return (
    <footer className="h-8 border-t flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">Focu v{version}</div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsShortcutDialogOpen(true)}
            >
              <KeyboardIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-row items-center gap-2">
              <p>Shortcuts</p>
              <Kbd>cmd+/</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsSettingsOpen(true)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-row items-center gap-2">
              <p>Settings</p>
              <Kbd>cmd+,</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
}
