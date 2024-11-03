import { type CheckIn, db } from "@/database/db";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CheckInStore {
  isCheckInOpen: boolean;
  setIsCheckInOpen: (isOpen: boolean) => void;
  checkInEnabled: boolean;
  setCheckInEnabled: (enabled: boolean) => void;
  checkInFocusWindow: boolean;
  setCheckInFocusWindow: (focusWindow: boolean) => void;
  checkInInterval: number;
  setCheckInInterval: (interval: number) => void;
  addCheckIn: (checkIn: CheckIn) => Promise<void>;
}

export const useCheckInStore = create<CheckInStore>()(
  persist(
    (set) => ({
      isCheckInOpen: false,
      setIsCheckInOpen: (isOpen) => set({ isCheckInOpen: isOpen }),
      checkInEnabled: true,
      setCheckInEnabled: (enabled) => set({ checkInEnabled: enabled }),
      checkInFocusWindow: true,
      setCheckInFocusWindow: (focusWindow) =>
        set({ checkInFocusWindow: focusWindow }),
      checkInInterval: 30 * 60 * 1000,
      setCheckInInterval: (interval) => set({ checkInInterval: interval }),
      addCheckIn: async (checkIn: CheckIn) => {
        await db.checkIns.add(checkIn);
      },
    }),
    {
      name: "checkin-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(useCheckInStore);