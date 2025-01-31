"use client";
import { useLicenseStore } from "@/store/licenseStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { Button } from "@repo/ui/components/ui/button";
import { Kbd } from "@repo/ui/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { KeyboardIcon, SettingsIcon } from "lucide-react";
import packageJson from "../../../package.json";

export function StatusFooter() {
  const {
    setIsSettingsOpen,
    setIsShortcutDialogOpen,
    isOllamaRunning,
    setSettingsCategory,
  } = useOllamaStore();
  const version = packageJson.version;
  const { instanceId, trialTimeLeft, openLicenseDialog } = useLicenseStore();
  return (
    <footer
      className="h-8 border-t flex items-center justify-between px-4 bg-background/50"
      data-tauri-drag-region
    >
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm text-muted-foreground">Focu v{version}</div>
        {!instanceId && (
          <div
            className="text-red-500 text-xs cursor-pointer"
            onClick={() => openLicenseDialog()}
          >
            {trialTimeLeft()} hours left in trial
          </div>
        )}
        {instanceId && <div className="text-green-500 text-xs">Activated</div>}
      </div>
      <div className="flex items-center gap-2">
        {!isOllamaRunning && (
          <div
            className="text-red-500 text-xs cursor-pointer"
            onClick={() => {
              setSettingsCategory("AI Models");
              setIsSettingsOpen(true);
            }}
          >
            Ollama not running
          </div>
        )}
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
