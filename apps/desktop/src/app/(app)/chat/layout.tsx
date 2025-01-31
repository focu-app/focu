"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChatStore } from "@/store/chatStore";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible } = useChatStore();

  return (
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
            <ChatSidebar />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
