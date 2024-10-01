import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { temporal } from 'zundo';
import { useChatStore } from "./chatStore";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { addTask, getTasksForDay, updateTaskCompletion, deleteTask, reorderTasks } from "@/database/tasks";
import type { Task } from "@/database/db";

export interface TaskState {
  notes: { [date: string]: string };
  addTask: (text: string) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  updateNotes: (text: string) => void;
  copyTasksFromPreviousDay: () => Promise<void>;
  copyTasksToNextDay: () => Promise<void>;
  editTask: (id: number, newText: string) => Promise<void>;
  clearTasks: (date: string) => Promise<void>;
  removeTasksForDate: (date: string, taskIds: number[]) => Promise<void>;
  clearFinishedTasks: (date: string) => Promise<void>;
}

const getDateString = (date: Date) => date.toISOString().split('T')[0];

export const useTaskStore = create<TaskState>()(
  persist(
    temporal(
      (set, get) => ({
        notes: {},
        addTask: async (text: string) => {
          const { selectedDate } = useChatStore.getState();
          const date = new Date(selectedDate);
          const tasks = await getTasksForDay(date);
          const newTask: Omit<Task, 'id'> = {
            text,
            completed: false,
            order: tasks.length,
            date: date.setHours(0, 0, 0, 0),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await addTask(newTask);
        },
        toggleTask: async (id: number) => {
          const tasks = await getTasksForDay(new Date());
          const task = tasks.find(t => t.id === id);
          if (task) {
            await updateTaskCompletion(id, !task.completed);
          }
        },
        removeTask: async (id: number) => {
          await deleteTask(id);
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
        copyTasksFromPreviousDay: async () => {
          const { selectedDate } = useChatStore.getState();
          const previousDate = new Date(selectedDate);
          previousDate.setDate(previousDate.getDate() - 1);

          const previousTasks = await getTasksForDay(previousDate);
          const uncompletedPreviousTasks = previousTasks.filter(task => !task.completed);

          const copiedTasks: Omit<Task, 'id'>[] = uncompletedPreviousTasks.map((task, index) => ({
            text: task.text,
            completed: false,
            order: index,
            date: new Date(selectedDate).setHours(0, 0, 0, 0),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          await Promise.all(copiedTasks.map(task => addTask(task)));
        },
        copyTasksToNextDay: async () => {
          const { selectedDate } = useChatStore.getState();
          const nextDate = new Date(selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);

          const currentTasks = await getTasksForDay(new Date(selectedDate));
          const uncompletedCurrentTasks = currentTasks.filter(task => !task.completed);

          const copiedTasks: Omit<Task, 'id'>[] = uncompletedCurrentTasks.map((task, index) => ({
            text: task.text,
            completed: false,
            order: index,
            date: nextDate.setHours(0, 0, 0, 0),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          await Promise.all(copiedTasks.map(task => addTask(task)));
        },
        editTask: async (id: number, newText: string) => {
          const tasks = await getTasksForDay(new Date());
          const task = tasks.find(t => t.id === id);
          if (task) {
            const updatedTask: Partial<Task> = {
              text: newText,
              updatedAt: Date.now(),
            };
            await reorderTasks(new Date(), tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t).map(t => t.id!));
          }
        },
        clearTasks: async (date: string) => {
          const tasks = await getTasksForDay(new Date(date));
          await Promise.all(tasks.map(task => deleteTask(task.id!)));
        },
        removeTasksForDate: async (date: string, taskIds: number[]) => {
          await Promise.all(taskIds.map(id => deleteTask(id)));
        },
        clearFinishedTasks: async (date: string) => {
          const tasks = await getTasksForDay(new Date(date));
          const finishedTasks = tasks.filter(task => task.completed);
          await Promise.all(finishedTasks.map(task => deleteTask(task.id!)));
        },
      }),
      { limit: 10 },
    ),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

withStorageDOMEvents(useTaskStore);