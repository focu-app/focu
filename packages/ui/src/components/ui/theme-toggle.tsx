"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="icon"
            onClick={() => setTheme("light")}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4" />
            <span className="sr-only">Light theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Light</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="icon"
            onClick={() => setTheme("dark")}
            className="h-8 w-8"
          >
            <Moon className="h-4 w-4" />
            <span className="sr-only">Dark theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dark</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="icon"
            onClick={() => setTheme("system")}
            className="h-8 w-8"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">System theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>System</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
