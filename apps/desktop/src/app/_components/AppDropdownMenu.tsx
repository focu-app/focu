"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { exit } from "@tauri-apps/api/process";
import { MoreVertical } from "lucide-react";
import { useCallback } from "react";

export const openSettingsWindow = async () => {
  const { WebviewWindow } = await import("@tauri-apps/api/window");
  await WebviewWindow.getByLabel("settings")?.show();
};

export function AppDropdownMenu() {
  const quitApp = useCallback(async () => {
    await exit(0);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={openSettingsWindow}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={quitApp}>Quit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
