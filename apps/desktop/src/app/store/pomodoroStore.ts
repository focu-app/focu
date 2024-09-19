import { create } from "zustand";
import { persistNSync } from "persist-and-sync"; // Add this import
import { invoke } from "@tauri-apps/api/tauri";

interface PomodoroState {
  mode: "work" | "shortBreak" | "longBreak";
  isActive: boolean;
  timeLeft: number;
  customWorkDuration: number;
  customShortBreakDuration: number;
  customLongBreakDuration: number;
  startTime: number | null;
  showSettings: boolean;
  setMode: (mode: "work" | "shortBreak" | "longBreak") => void;
  toggleActive: () => void;
  resetTimer: () => void;
  setCustomWorkDuration: (duration: number) => void;
  setCustomShortBreakDuration: (duration: number) => void;
  setCustomLongBreakDuration: (duration: number) => void;
  setShowSettings: (show: boolean) => void;
  setTimeLeft: (time: number) => void;
  setStartTime: (time: number | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  formatTime: (time: number) => string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const updateTrayTitle = async (title: string) => {
  await invoke("set_tray_title", { title });
};

export const usePomodoroStore = create<PomodoroState>(
  persistNSync(
    (set, get) => ({
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
      setCustomWorkDuration: (duration) => set({ customWorkDuration: duration }),
      setCustomShortBreakDuration: (duration) => set({ customShortBreakDuration: duration }),
      setCustomLongBreakDuration: (duration) => set({ customLongBreakDuration: duration }),
      setShowSettings: (show) => set({ showSettings: show }),
      setTimeLeft: (time) => {
        set({ timeLeft: time });
        updateTrayTitle(formatTime(time));
      },
      setStartTime: (time) => set({ startTime: time }),
      startTimer: () => {
        const startTime = Date.now();
        set({
          isActive: true,
          startTime,
        });
        updateTrayTitle(formatTime(get().timeLeft));
      },
      pauseTimer: () => {
        set({
          isActive: false,
        });
        updateTrayTitle(formatTime(get().timeLeft));
      },
      resetTimer: () => {
        const state = get();
        let duration: number;
        if (state.mode === "work") {
          duration = state.customWorkDuration;
        } else if (state.mode === "shortBreak") {
          duration = state.customShortBreakDuration;
        } else {
          duration = state.customLongBreakDuration;
        }
        set({
          isActive: false,
          timeLeft: duration,
          startTime: null,
        });
        updateTrayTitle(formatTime(duration));
      },
      formatTime,
    }),
    {
      name: "pomodoro-storage",
    }
  )
);