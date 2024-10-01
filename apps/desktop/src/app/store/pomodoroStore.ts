import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware'
import { invoke } from "@tauri-apps/api/tauri";
import * as workerTimers from "worker-timers";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

interface PomodoroState {
  mode: "work" | "shortBreak" | "longBreak";
  isActive: boolean;
  timeLeft: number;
  customWorkDuration: number;
  customShortBreakDuration: number;
  customLongBreakDuration: number;
  startTime: number | null;
  showSettings: boolean;
  intervalId: number | null;
  setMode: (mode: "work" | "shortBreak" | "longBreak") => void;
  toggleActive: () => void;
  resetTimer: () => void;
  setCustomWorkDuration: (duration: number) => void;
  setCustomShortBreakDuration: (duration: number) => void;
  setCustomLongBreakDuration: (duration: number) => void;
  setShowSettings: (show: boolean) => void;
  setTimeLeft: (time: number) => void;
  setIsActive: (isActive: boolean) => void;
  setStartTime: (time: number | null) => void;
  setIntervalId: (intervalId: number | null) => void;
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

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "work",
      isActive: false,
      timeLeft: 1500, // 25 minutes
      customWorkDuration: 1500,
      customShortBreakDuration: 300, // 5 minutes
      customLongBreakDuration: 900,  // 15 minutes
      startTime: null,
      showSettings: false,
      intervalId: null, // Initialize intervalId
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
      setIsActive: (isActive) => set({ isActive }),
      setStartTime: (time) => set({ startTime: time }),
      setIntervalId: (intervalId) => set({ intervalId }),
      startTimer: () => {
        workerTimers.clearInterval(get().intervalId || 0);

        const startTime = Date.now();
        set({
          isActive: true,
          startTime,
        });
        updateTrayTitle(formatTime(get().timeLeft));

        const tick = () => {
          console.log("tick");
          const now = Date.now();
          const elapsed = Math.floor((now - (startTime || now)) / 1000);
          const newTimeLeft = Math.max(get().timeLeft - 1, 0);

          const { intervalId } = get();

          if (!get().isActive && intervalId !== null) {
            workerTimers.clearInterval(intervalId);
            set({ intervalId: null });
          } else {
            get().setTimeLeft(newTimeLeft);
          }


          if (newTimeLeft === 0) {
            if (get().mode === "work") {
              get().handleModeChange("shortBreak");
            } else {
              get().handleModeChange("work");
            }
          }
        };

        const intervalId = workerTimers.setInterval(tick, 1000);
        get().setIntervalId(intervalId); // Store the intervalId in the state
      },
      pauseTimer: () => {
        get().setIsActive(false);
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
          mode: "work",
        });
        updateTrayTitle(formatTime(duration));
      },
      formatTime,
      handleModeChange: (newMode) => {
        const state = get();
        state.pauseTimer();
        set({ mode: newMode });
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
        switch (modes[nextIndex]) {
          case "work":
            state.setTimeLeft(state.customWorkDuration);
            break;
          case "shortBreak":
            state.setTimeLeft(state.customShortBreakDuration);
            break;
          case "longBreak":
            state.setTimeLeft(state.customLongBreakDuration);
            break;
        }
      },
    }),
    {
      name: "pomodoro-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(usePomodoroStore);