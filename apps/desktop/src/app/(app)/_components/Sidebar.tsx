"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { ListTodo, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-16 border-r flex flex-col items-center py-4 space-y-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={pathname.startsWith("/chat") ? "default" : "ghost"}
            size="icon"
            onClick={() => router.push("/chat")}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Chat</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={pathname === "/focus" ? "default" : "ghost"}
            size="icon"
            onClick={() => router.push("/focus")}
          >
            <ListTodo className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" alignOffset={-15}>
          <p>Focus</p>
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}
