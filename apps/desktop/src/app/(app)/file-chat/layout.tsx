"use client";

import { FileChatSidebar } from "@/components/file-chat/FileChatSidebar";
import { useFileChatStore } from "@/store/fileChatStore";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";

export default function FileChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible } = useFileChatStore();

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-full">
        <AnimatePresence initial={false}>
          {isSidebarVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-hidden border-r"
            >
              <FileChatSidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </TooltipProvider>
  );
}
