"use client";

import { JournalSidebar } from "../../../components/journal/JournalSidebar";
import { useJournalStore } from "@/store/journalStore";
import { AnimatePresence, motion } from "framer-motion";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarVisible } = useJournalStore();

  return (
    <div className="flex h-full">
      <AnimatePresence initial={false}>
        {isSidebarVisible && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-hidden border-r"
          >
            <JournalSidebar />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
