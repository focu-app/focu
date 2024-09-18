import create from "zustand";
import { persistNSync } from "persist-and-sync"; // Add this import

interface PomodoroState {
  mode: "work" | "shortBreak" | "longBreak"; // Updated modes
  isActive: boolean;
  timeLeft: number;
  customWorkDuration: number;
  customShortBreakDuration: number; // Added
  customLongBreakDuration: number;  // Added
  startTime: number | null;
  showSettings: boolean;
  setMode: (mode: "work" | "shortBreak" | "longBreak") => void; // Updated
  toggleActive: () => void;
  resetTimer: () => void;
  setCustomWorkDuration: (duration: number) => void;
  setCustomShortBreakDuration: (duration: number) => void; // Added
  setCustomLongBreakDuration: (duration: number) => void;  // Added
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
      customShortBreakDuration: 300, // 5 minutes
      customLongBreakDuration: 900,  // 15 minutes
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
          customShortBreakDuration: 300,
          customLongBreakDuration: 900,
        }),
      setCustomWorkDuration: (duration) => set({ customWorkDuration: duration }),
      setCustomShortBreakDuration: (duration) => set({ customShortBreakDuration: duration }), // Added
      setCustomLongBreakDuration: (duration) => set({ customLongBreakDuration: duration }),   // Added
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