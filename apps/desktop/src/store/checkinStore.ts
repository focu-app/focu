import { type CheckIn, db } from "@/database/db";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CheckInStore {
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
  checkInEnabled: boolean;
  setCheckInEnabled: (enabled: boolean) => void;
  checkInFocusWindow: boolean;
  setCheckInFocusWindow: (focusWindow: boolean) => void;
  checkInInterval: number;
  setCheckInInterval: (interval: number) => void;
  addCheckIn: (checkIn: CheckIn) => Promise<void>;
  checkInToDelete: number | null;
  setCheckInToDelete: (id: number | null) => void;
}

export const useCheckInStore = create<CheckInStore>()(
  persist(
    (set) => ({
      isCheckInOpen: false,
      setIsCheckInOpen: (open) => set({ isCheckInOpen: open }),
      checkInEnabled: true,
      setCheckInEnabled: (enabled) => set({ checkInEnabled: enabled }),
      checkInFocusWindow: true,
      setCheckInFocusWindow: (focusWindow) =>
        set({ checkInFocusWindow: focusWindow }),
      checkInInterval: 60 * 60 * 1000,
      setCheckInInterval: (interval) => set({ checkInInterval: interval }),
      addCheckIn: async (checkIn: CheckIn) => {
        await db.checkIns.add(checkIn);
      },
      checkInToDelete: null,
      setCheckInToDelete: (id) => set({ checkInToDelete: id }),
    }),
    {
      name: "checkin-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

withStorageDOMEvents(useCheckInStore);
