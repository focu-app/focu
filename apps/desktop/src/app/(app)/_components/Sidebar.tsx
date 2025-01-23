"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  Brain,
  Clock,
  ListTodo,
  MessageSquare,
  HeartPulse,
} from "lucide-react";
import { usePathname } from "next/navigation";
// import { useTransitionRouter as useRouter } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCmdPressed, setIsCmdPressed] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey) {
        timeoutId = setTimeout(() => {
          setIsCmdPressed(true);
        }, 500);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey) {
        clearTimeout(timeoutId);
        setIsCmdPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", () => {
      clearTimeout(timeoutId);
      setIsCmdPressed(false);
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", () => setIsCmdPressed(false));
    };
  }, []);

  // Add keyboard shortcuts
  useHotkeys("mod+1", () => router.push("/chat"), { enableOnFormTags: true });
  useHotkeys("mod+2", () => router.push("/focus"), { enableOnFormTags: true });
  useHotkeys("mod+3", () => router.push("/tasks"), { enableOnFormTags: true });
  useHotkeys("mod+4", () => router.push("/check-in"), {
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

  console.log("render");

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
    </aside>
  );
}
