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
  removeTask: (id: string) => Task | undefined;
  updateNotes: (text: string) => void;
  copyTasksFromPreviousDay: () => void;
  copyTasksToNextDay: () => void;
  editTask: (id: string, newText: string) => string;
  clearTasks: (date: string) => Task[];
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
        let removedTask: Task | undefined;
        set((state) => {
          const tasksForDate = state.tasks[selectedDate] || [];
          removedTask = tasksForDate.find((task) => task.id === id);
          return {
            tasks: {
              ...state.tasks,
              [selectedDate]: tasksForDate.filter((task) => task.id !== id),
            },
          };
        });
        return removedTask!;
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

        let copiedTasks: Task[] = [];
        set((state) => {
          const previousTasks = state.tasks[previousDateString] || [];
          const currentTasks = state.tasks[selectedDate] || [];

          const uncompletedPreviousTasks = previousTasks.filter(task => !task.completed);

          copiedTasks = uncompletedPreviousTasks.map(task => ({
            ...task,
            id: Date.now().toString() + Math.random(),
            completed: false,
            createdAt: selectedDate,
          }));

          const newTasks = [...currentTasks, ...copiedTasks];

          return {
            tasks: {
              ...state.tasks,
              [selectedDate]: newTasks,
            },
          };
        });
        return copiedTasks;
      },

      copyTasksToNextDay: () => {
        const { selectedDate } = useChatStore.getState();
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = nextDate.toISOString().split('T')[0];

        let copiedTasks: Task[] = [];
        set((state) => {
          const currentTasks = state.tasks[selectedDate] || [];
          const nextDayTasks = state.tasks[nextDateString] || [];

          const uncompletedCurrentTasks = currentTasks.filter(task => !task.completed);

          copiedTasks = uncompletedCurrentTasks.map(task => ({
            ...task,
            id: Date.now().toString() + Math.random(),
            completed: false,
            createdAt: nextDateString,
          }));

          const newTasks = [...nextDayTasks, ...copiedTasks];

          return {
            tasks: {
              ...state.tasks,
              [nextDateString]: newTasks,
            },
          };
        });
        return copiedTasks;
      },
      editTask: (id: string, newText: string) => {
        const { selectedDate } = useChatStore.getState();
        let oldText = '';
        set((state) => {
          const tasksForDate = state.tasks[selectedDate] || [];
          const updatedTasks = tasksForDate.map((task) => {
            if (task.id === id) {
              oldText = task.text;
              return { ...task, text: newText };
            }
            return task;
          });
          return {
            tasks: {
              ...state.tasks,
              [selectedDate]: updatedTasks,
            },
          };
        });
        return oldText;
      },
      clearTasks: (date: string) => {
        let clearedTasks: Task[] = [];
        set((state) => {
          clearedTasks = state.tasks[date] || [];
          return {
            tasks: {
              ...state.tasks,
              [date]: [],
            },
          };
        });
        return clearedTasks;
      },
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(useTaskStore);