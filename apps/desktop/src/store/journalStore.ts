import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

interface JournalUIState {
  // View mode
  viewMode: "edit" | "preview";
  setViewMode: (mode: "edit" | "preview") => void;

  // UI preferences
  showTags: boolean;
  showToolbar: boolean;
  showLineNumbers: boolean;
  toggleShowTags: () => void;
  toggleShowToolbar: () => void;
  toggleShowLineNumbers: () => void;
}

// Create the store with persistence
export const useJournalStore = create<JournalUIState>()(
  persist(
    (set) => ({
      // Default states
      viewMode: "edit",
      showTags: false,
      showToolbar: false,
      showLineNumbers: false,

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleShowTags: () => set((state) => ({ showTags: !state.showTags })),
      toggleShowToolbar: () =>
        set((state) => ({ showToolbar: !state.showToolbar })),
      toggleShowLineNumbers: () =>
        set((state) => ({ showLineNumbers: !state.showLineNumbers })),
    }),
    {
      name: "journal-ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Setup storage DOM events for cross-tab state synchronization
withStorageDOMEvents(useJournalStore);
