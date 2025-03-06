import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { journalService } from "@/lib/journalService";
import { toast } from "@repo/ui/hooks/use-toast";

interface JournalUIState {
  // View mode
  viewMode: "edit" | "preview";
  setViewMode: (mode: "edit" | "preview") => void;

  // Sidebar visibility
  isSidebarVisible: boolean;
  toggleSidebar: () => void;

  // UI preferences
  showTags: boolean;
  showToolbar: boolean;
  toggleShowTags: () => void;
  toggleShowToolbar: () => void;

  // Entry creation
  createNewEntry: () => Promise<number | undefined>;
}

// Create the store with persistence
export const useJournalStore = create<JournalUIState>()(
  persist(
    (set) => ({
      // Default states
      viewMode: "edit",
      showTags: false,
      showToolbar: false,
      isSidebarVisible: true,

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
      toggleShowTags: () => set((state) => ({ showTags: !state.showTags })),
      toggleShowToolbar: () =>
        set((state) => ({ showToolbar: !state.showToolbar })),

      // Entry creation
      createNewEntry: async () => {
        // Ensure we're in edit mode
        set({ viewMode: "edit" });

        try {
          // Create a new entry
          return await journalService.createNewEntry();
        } catch (error) {
          console.error("Error creating new journal entry:", error);
          toast({
            title: "Error",
            description: "Failed to create new journal entry",
            variant: "destructive",
          });
          return undefined;
        }
      },
    }),
    {
      name: "journal-ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Setup storage DOM events for cross-tab state synchronization
withStorageDOMEvents(useJournalStore);
