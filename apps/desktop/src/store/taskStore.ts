import type { Task } from "@/database/db";
import {
  addTask,
  bulkUpdateTaskOrder,
  deleteTask,
  getTaskById,
  getTasksForDay,
  updateTask,
  updateTaskCompletion,
} from "@/database/tasks";
import { format } from "date-fns";
import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./chatStore";

export interface TaskState {
  addTask: (text: string) => Promise<void>;
  addMultipleTasks: (tasks: string[]) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  copyTasksFromPreviousDay: () => Promise<void>;
  copyTasksToNextDay: () => Promise<void>;
  editTask: (id: number, newText: string) => Promise<void>;
  clearTasks: (date: string) => Promise<void>;
  removeTasksForDate: (date: string, taskIds: number[]) => Promise<void>;
  clearFinishedTasks: (date: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  showTaskInput: boolean;
  setShowTaskInput: (show: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    temporal(
      (set, get) => ({
        addTask: async (text: string) => {
          const { selectedDate } = useChatStore.getState();
          if (!selectedDate) return;
          const tasks = await getTasksForDay(selectedDate);
          const newTask: Omit<Task, "id"> = {
            text,
            completed: false,
            order: tasks.length,
            dateString: selectedDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await addTask(newTask);
        },
        toggleTask: async (id: number) => {
          const task = await getTaskById(id);
          if (task) {
            await updateTaskCompletion(id, !task.completed);
          }
        },
        removeTask: async (id: number) => {
          await deleteTask(id);
        },
        copyTasksFromPreviousDay: async () => {
          const { selectedDate } = useChatStore.getState();
          if (!selectedDate) return;
          const previousDate = new Date(`${selectedDate}T00:00:00`);
          previousDate.setDate(previousDate.getDate() - 1);
          const previousDateString = format(previousDate, "yyyy-MM-dd");
          const previousTasks = await getTasksForDay(previousDateString);
          const uncompletedPreviousTasks = previousTasks.filter(
            (task) => !task.completed,
          );

          const copiedTasks: Omit<Task, "id">[] = uncompletedPreviousTasks.map(
            (task, index) => ({
              text: task.text,
              completed: false,
              order: index,
              dateString: selectedDate,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
          );

          await Promise.all(copiedTasks.map((task) => addTask(task)));
        },
        copyTasksToNextDay: async () => {
          const { selectedDate } = useChatStore.getState();
          if (!selectedDate) return;
          const nextDate = new Date(`${selectedDate}T00:00:00`);
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateString = format(nextDate, "yyyy-MM-dd");

          const currentTasks = await getTasksForDay(selectedDate);
          const uncompletedCurrentTasks = currentTasks.filter(
            (task) => !task.completed,
          );

          const copiedTasks: Omit<Task, "id">[] = uncompletedCurrentTasks.map(
            (task, index) => ({
              text: task.text,
              completed: false,
              order: index,
              dateString: nextDateString,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
          );

          await Promise.all(copiedTasks.map((task) => addTask(task)));
        },
        editTask: async (id: number, newText: string) => {
          await updateTask(id, { text: newText });
        },
        clearTasks: async (dateString: string) => {
          const tasks = await getTasksForDay(dateString);
          await Promise.all(tasks.map((task) => deleteTask(task.id!)));
        },
        removeTasksForDate: async (date: string, taskIds: number[]) => {
          await Promise.all(taskIds.map((id) => deleteTask(id)));
        },
        clearFinishedTasks: async (dateString: string) => {
          const tasks = await getTasksForDay(dateString);
          const finishedTasks = tasks.filter((task) => task.completed);
          await Promise.all(finishedTasks.map((task) => deleteTask(task.id!)));
        },
        reorderTasks: async (tasks: Task[]) => {
          const tasksWithUpdatedOrder = tasks.map((task, index) => ({
            ...task,
            order: index,
          }));
          await bulkUpdateTaskOrder(tasksWithUpdatedOrder);
        },
        showTaskInput: false,
        setShowTaskInput: (show: boolean) => set({ showTaskInput: show }),
        addMultipleTasks: async (tasks: string[]) => {
          const { selectedDate } = useChatStore.getState();
          if (!selectedDate) return;
          const existingTasks = await getTasksForDay(selectedDate);
          const existingTaskTexts = new Set(
            existingTasks.map((t) => t.text.toLowerCase()),
          );

          const newTasks = tasks.filter(
            (task) => !existingTaskTexts.has(task.toLowerCase()),
          );

          for (const task of newTasks) {
            const newTask: Omit<Task, "id"> = {
              text: task,
              completed: false,
              order: existingTasks.length + newTasks.indexOf(task),
              dateString: selectedDate,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            await addTask(newTask);
          }
        },
      }),
      { limit: 10 },
    ),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
