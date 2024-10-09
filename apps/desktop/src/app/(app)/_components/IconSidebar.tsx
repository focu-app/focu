"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, ListTodo } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export function IconSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-16 border-r flex flex-col items-center py-4 space-y-4">
      <Button
        variant={pathname.startsWith("/chat") ? "default" : "ghost"}
        size="icon"
        onClick={() => router.push("/chat")}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      <Button
        variant={pathname === "/focus" ? "default" : "ghost"}
        size="icon"
        onClick={() => router.push("/focus")}
      >
        <ListTodo className="h-5 w-5" />
      </Button>
    </aside>
  );
}
