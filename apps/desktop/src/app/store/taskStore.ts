import { persistNSync } from "persist-and-sync";
import { create } from "zustand";
import { useChatStore } from "./chatStore";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: { [date: string]: Task[] };
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persistNSync(
    (set) => ({
      tasks: {},
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
    }),
    {
      name: "task-storage",
    }
  )
);
