import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskState {
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (text: string) => set((state) => ({
        tasks: [...state.tasks, { id: Date.now().toString(), text, completed: false, createdAt: new Date() }],
      })),
      toggleTask: (id: string) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ),
      })),
      removeTask: (id: string) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
    }),
    {
      name: 'task-storage',
    }
  )
);