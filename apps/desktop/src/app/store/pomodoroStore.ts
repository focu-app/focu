import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware'
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
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
      startTimer: async () => {
        const state = get();
        console.log("Starting timer with duration:", state.timeLeft);
        await invoke("resume_timer_command");
        set({ isActive: true, startTime: Date.now() });
      },
      pauseTimer: async () => {
        console.log("Pausing timer");
        const remainingTime = await invoke<number>("pause_timer_command");
        console.log("Remaining time returned from Rust:", remainingTime);
        set({ isActive: false, startTime: null, timeLeft: remainingTime });
        updateTrayTitle(formatTime(remainingTime));
      },
      resetTimer: () => {
        console.log("Resetting timer");
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
      handleModeChange: async (newMode) => {
        const state = get();
        await state.pauseTimer(); // Ensure the timer is paused
        let duration: number;
        if (newMode === "work") {
          duration = state.customWorkDuration;
        } else if (newMode === "shortBreak") {
          duration = state.customShortBreakDuration;
        } else {
          duration = state.customLongBreakDuration;
        }
        set({
          mode: newMode,
          timeLeft: duration,
          isActive: false
        });
        updateTrayTitle(formatTime(duration));
        // Restart the timer in Rust with the new duration
        await invoke("start_timer_command", { duration });
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
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(usePomodoroStore);

listen<number>("timer-tick", (event) => {
  console.log("Timer tick received:", event.payload);
  usePomodoroStore.getState().setTimeLeft(event.payload);
});

listen("timer-completed", () => {
  console.log("Timer completed event received");
  const store = usePomodoroStore.getState();
  store.setIsActive(false);
  store.handleSkipForward();
});