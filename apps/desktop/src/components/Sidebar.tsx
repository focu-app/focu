"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  BookText,
  Clock,
  HeartPulse,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCmdPressed, setIsCmdPressed] = useState(false);

  useEffect(() => {
    const handleKeyChange = (e: KeyboardEvent) => {
      // Only show numbers if Command is the only modifier key pressed
      setIsCmdPressed(e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey);
    };

    const handleVisibilityOrBlur = () => {
      setIsCmdPressed(false);
    };

    window.addEventListener("keydown", handleKeyChange);
    window.addEventListener("keyup", handleKeyChange);
    window.addEventListener("blur", handleVisibilityOrBlur);
    document.addEventListener("visibilitychange", handleVisibilityOrBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyChange);
      window.removeEventListener("keyup", handleKeyChange);
      window.removeEventListener("blur", handleVisibilityOrBlur);
      document.removeEventListener("visibilitychange", handleVisibilityOrBlur);
    };
  }, []);

  useHotkeys("mod+1", () => router.push("/chat"), { enableOnFormTags: true });
  useHotkeys("mod+2", () => router.push("/focus"), { enableOnFormTags: true });
  useHotkeys("mod+3", () => router.push("/tasks"), { enableOnFormTags: true });
  useHotkeys("mod+4", () => router.push("/check-in"), {
    enableOnFormTags: true,
  });
  useHotkeys("mod+5", () => router.push("/journal"), {
    enableOnFormTags: true,
  });

  const NavButton = ({
    path,
    icon: Icon,
    label,
    shortcutNumber,
  }: {
    path: string;
    icon: React.ElementType;
    label: string;
    shortcutNumber: number;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            className={
              pathname.startsWith(path)
                ? "bg-primary/20 hover:bg-primary/20"
                : ""
            }
            size="icon"
            onClick={() => router.push(path)}
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
          </Button>
          {isCmdPressed && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-muted text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center">
              {shortcutNumber}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" align="start">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <aside
      className="w-[70px] flex flex-col items-center py-4 space-y-4 border-r"
      data-tauri-drag-region
    >
      <div className="" />
      <NavButton
        path="/chat"
        icon={MessageSquare}
        label="Chats"
        shortcutNumber={1}
      />
      <NavButton path="/focus" icon={Clock} label="Focus" shortcutNumber={2} />
      <NavButton
        path="/tasks"
        icon={ListTodo}
        label="Tasks"
        shortcutNumber={3}
      />
      <NavButton
        path="/check-in"
        icon={HeartPulse}
        label="Check-ins"
        shortcutNumber={4}
      />
      <NavButton
        path="/journal"
        icon={BookText}
        label="Journal"
        shortcutNumber={5}
      />
    </aside>
  );
}
