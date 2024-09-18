import create from "zustand";
import { persistNSync } from "persist-and-sync"; // Add this import

interface PomodoroState {
  mode: "work" | "break";
  isActive: boolean;
  timeLeft: number;
  customWorkDuration: number;
  customBreakDuration: number;
  startTime: number | null;
  showSettings: boolean;
  setMode: (mode: "work" | "break") => void;
  toggleActive: () => void;
  resetTimer: () => void;
  setCustomWorkDuration: (duration: number) => void;
  setCustomBreakDuration: (duration: number) => void;
  setShowSettings: (show: boolean) => void;
  setTimeLeft: (time: number) => void;
  setStartTime: (time: number | null) => void;
  startTimer: () => void; // Add this
  pauseTimer: () => void; // Add this
}

export const usePomodoroStore = create<PomodoroState>(
  persistNSync(
    (set) => ({
      mode: "work",
      isActive: false,
      timeLeft: 1500, // 25 minutes
      customWorkDuration: 1500,
      customBreakDuration: 300, // 5 minutes
      startTime: null,
      showSettings: false,
      setMode: (mode) => set({ mode }),
      toggleActive: () => set((state) => ({ isActive: !state.isActive })),
      resetTimer: () =>
        set({
          isActive: false,
          timeLeft: 1500,
          startTime: null,
          mode: "work",
          customWorkDuration: 1500,
          customBreakDuration: 300,
        }),
      setCustomWorkDuration: (duration) => {
        set({ customWorkDuration: duration });
        // set({ timeLeft: duration });
      },
      setCustomBreakDuration: (duration) =>
        set({ customBreakDuration: duration }),
      setShowSettings: (show) => set({ showSettings: show }),
      setTimeLeft: (time) => set({ timeLeft: time }),
      setStartTime: (time) => set({ startTime: time }),
      startTimer: () =>
        set({
          isActive: true,
          startTime: Date.now(),
        }),
      pauseTimer: () =>
        set({
          isActive: false,
        }),
    }),
    {
      name: "pomodoro-storage",
    }
  )
);