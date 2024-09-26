import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./chatStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: { [date: string]: Task[] };
  notes: { [date: string]: string };
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  updateNotes: (text: string) => void;
  copyTasksFromPreviousDay: () => void;
  copyTasksToNextDay: () => void;
  editTask: (id: string, newText: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: {},
      notes: {},
      addTask: (text: string) => {
        const { selectedDate } = useChatStore.getState();
        set((state) => {
          const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: selectedDate,
          };
          return {
            tasks: {
              ...state.tasks,
              [selectedDate]: [
                ...(state.tasks[selectedDate] || []),
                newTask,
              ],
            },
          };
        });
      },
      toggleTask: (id: string) => {
        const { selectedDate } = useChatStore.getState();
        set((state) => ({
          tasks: {
            ...state.tasks,
            [selectedDate]: state.tasks[selectedDate]?.map((task) =>
              task.id === id ? { ...task, completed: !task.completed } : task
            ) || [],
          },
        }));
      },
      removeTask: (id: string) => {
        const { selectedDate } = useChatStore.getState();
        set((state) => ({
          tasks: {
            ...state.tasks,
            [selectedDate]: state.tasks[selectedDate]?.filter(
              (task) => task.id !== id
            ) || [],
          },
        }));
      },
      updateNotes: (text: string) => {
        const { selectedDate } = useChatStore.getState();
        set((state) => ({
          notes: {
            ...state.notes,
            [selectedDate]: text,
          },
        }));
      },
      copyTasksFromPreviousDay: () => {
        const { selectedDate } = useChatStore.getState();
        const previousDate = new Date(selectedDate);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateString = previousDate.toISOString().split('T')[0];

        set((state) => {
          const previousTasks = state.tasks[previousDateString] || [];
          const currentTasks = state.tasks[selectedDate] || [];

          const uncompletedPreviousTasks = previousTasks.filter(task => !task.completed);

          const newTasks = [
            ...currentTasks,
            ...uncompletedPreviousTasks.map(task => ({
              ...task,
              id: Date.now().toString() + Math.random(),
              completed: false,
              createdAt: selectedDate,
            }))
          ];

          return {
            tasks: {
              ...state.tasks,
              [selectedDate]: newTasks,
            },
          };
        });
      },

      copyTasksToNextDay: () => {
        const { selectedDate } = useChatStore.getState();
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = nextDate.toISOString().split('T')[0];

        set((state) => {
          const currentTasks = state.tasks[selectedDate] || [];
          const nextDayTasks = state.tasks[nextDateString] || [];

          const uncompletedCurrentTasks = currentTasks.filter(task => !task.completed);

          const newTasks = [
            ...nextDayTasks,
            ...uncompletedCurrentTasks.map(task => ({
              ...task,
              id: Date.now().toString() + Math.random(),
              completed: false,
              createdAt: nextDateString,
            }))
          ];

          return {
            tasks: {
              ...state.tasks,
              [nextDateString]: newTasks,
            },
          };
        });
      },
      editTask: (id: string, newText: string) => {
        const { selectedDate } = useChatStore.getState();
        set((state) => ({
          tasks: {
            ...state.tasks,
            [selectedDate]: state.tasks[selectedDate]?.map((task) =>
              task.id === id ? { ...task, text: newText } : task
            ) || [],
          },
        }));
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(useTaskStore);