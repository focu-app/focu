import { create } from "zustand";
import { persistNSync } from "persist-and-sync";
import { invoke } from "@tauri-apps/api/tauri";
import * as workerTimers from "worker-timers";

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
  handleModeChange: (newMode: "work" | "shortBreak" | "longBreak") => void;
  handleSkipForward: () => void;
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

        const tick = () => {
          const now = Date.now();
          const elapsed = Math.floor((now - (startTime || now)) / 1000);
          const newTimeLeft = Math.max(get().timeLeft - 1, 0);

          get().setTimeLeft(newTimeLeft);

          if (newTimeLeft === 0) {
            if (get().mode === "work") {
              get().handleModeChange("shortBreak");
            } else {
              get().handleModeChange("work");
            }
          }
        };

        workerTimers.setInterval(tick, 1000);
      },
      pauseTimer: () => {
        set({
          isActive: false,
        });
        updateTrayTitle(formatTime(get().timeLeft));
        workerTimers.clearInterval();
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
        workerTimers.clearInterval();
      },
      formatTime,
      handleModeChange: (newMode) => {
        const state = get();
        set({ mode: newMode });
        state.pauseTimer();
        let duration: number;
        if (newMode === "work") {
          duration = state.customWorkDuration;
        } else if (newMode === "shortBreak") {
          duration = state.customShortBreakDuration;
        } else {
          duration = state.customLongBreakDuration;
        }
        set({
          timeLeft: duration,
          startTime: null,
        });
      },
      handleSkipForward: () => {
        const state = get();
        const modes = ["work", "shortBreak", "longBreak"];
        const currentIndex = modes.indexOf(state.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        state.handleModeChange(modes[nextIndex] as "work" | "shortBreak" | "longBreak");
      },
    }),
    {
      name: "pomodoro-storage",
    }
  )
);