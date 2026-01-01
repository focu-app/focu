"use client";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@repo/ui/components/ui/button";
import { Kbd } from "@repo/ui/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { KeyboardIcon, SettingsIcon } from "lucide-react";
import packageJson from "../../package.json";

export function StatusFooter() {
  const { isOllamaRunning, setIsShortcutDialogOpen } = useOllamaStore();
  const { activeModel, isModelAvailable } = useAIProviderStore();
  const { setIsSettingsOpen, setSettingsCategory } = useSettingsStore();
  const version = packageJson.version;
  return (
    <footer
      className="h-8 border-t flex items-center justify-between px-4 bg-background/50"
      data-tauri-drag-region
    >
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm text-muted-foreground">Focu v{version}</div>
      </div>
      <div className="flex items-center gap-2">
        {!isOllamaRunning && !isModelAvailable(activeModel!) && (
          <div
            className="text-red-500 text-xs cursor-pointer"
            onClick={() => {
              setSettingsCategory("Local AI");
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
