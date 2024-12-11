"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Brain, Clock, ListTodo, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransitionRouter as useRouter } from "next-view-transitions";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className="w-[70px] flex flex-col items-center py-4 space-y-4 border-r"
      data-tauri-drag-region
    >
      <div className="" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={
              pathname.startsWith("/chat")
                ? "bg-primary/20 hover:bg-primary/20"
                : ""
            }
            size="icon"
            onClick={() => router.push("/chat")}
          >
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Chat</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={
              pathname === "/focus" ? "bg-primary/20 hover:bg-primary/20" : ""
            }
            size="icon"
            onClick={() => router.push("/focus")}
          >
            <Clock className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Focus</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={
              pathname === "/tasks" ? "bg-primary/20 hover:bg-primary/20" : ""
            }
            size="icon"
            onClick={() => router.push("/tasks")}
          >
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Tasks</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={
              pathname === "/reflection"
                ? "bg-primary/20 hover:bg-primary/20"
                : ""
            }
            size="icon"
            onClick={() => router.push("/reflection")}
          >
            <Brain className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Reflection</p>
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}
