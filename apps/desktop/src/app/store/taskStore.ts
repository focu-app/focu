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
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(useTaskStore);