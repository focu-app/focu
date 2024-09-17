import { persistNSync } from "persist-and-sync";
import { create } from "zustand";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // Change this to string to store date
}

interface TaskState {
  tasks: { [date: string]: Task[] };
  selectedDate: string;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  setSelectedDate: (date: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persistNSync(
    (set, get) => ({
      tasks: {},
      selectedDate: new Date().toISOString().split("T")[0],
      addTask: (text: string) =>
        set((state) => {
          const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: state.selectedDate,
          };
          return {
            tasks: {
              ...state.tasks,
              [state.selectedDate]: [
                ...(state.tasks[state.selectedDate] || []),
                newTask,
              ],
            },
          };
        }),
      toggleTask: (id: string) =>
        set((state) => ({
          tasks: {
            ...state.tasks,
            [state.selectedDate]: state.tasks[state.selectedDate].map((task) =>
              task.id === id ? { ...task, completed: !task.completed } : task,
            ),
          },
        })),
      removeTask: (id: string) =>
        set((state) => ({
          tasks: {
            ...state.tasks,
            [state.selectedDate]: state.tasks[state.selectedDate].filter(
              (task) => task.id !== id,
            ),
          },
        })),
      setSelectedDate: (date: string) => set({ selectedDate: date }),
    }),
    {
      name: "task-storage",
    },
  ),
);
