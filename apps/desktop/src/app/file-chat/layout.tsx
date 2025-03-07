"use client";

import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { FileChatSidebar } from "@/components/file-chat/FileChatSidebar";

export default function FileChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-full">
        <div className="w-64 h-full overflow-hidden border-r">
          <FileChatSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </TooltipProvider>
  );
}
