import { db } from "./db";
import type { Task } from "./db";
const getStartOfDay = (date: Date = new Date()): number => {
  return date.setHours(0, 0, 0, 0);
};

// Add a new task
export async function addTask(task: Omit<Task, 'id'>): Promise<number> {
  return await db.tasks.add(task);
}

// Get all tasks for a specific day
export async function getTasksForDay(date: Date = new Date()): Promise<Task[]> {
  const dayStart = getStartOfDay(date);
  return await db.tasks
    .where('date')
    .equals(dayStart)
    .sortBy('order');
}

// Get incomplete tasks for today
export async function getIncompleteTasks(): Promise<Task[]> {
  const today = getStartOfDay();
  return await db.tasks
    .where('date')
    .equals(today)
    .and(task => !task.completed)
    .sortBy('order');
}

// Update task completion status
export async function updateTaskCompletion(id: number, completed: boolean): Promise<void> {
  await db.tasks.update(id, { completed, updatedAt: Date.now() });
}

// Reorder tasks for a specific day
export async function reorderTasks(date: Date, newOrder: number[]): Promise<void> {
  const dayStart = getStartOfDay(date);
  await db.transaction('rw', db.tasks, async () => {
    const tasks = await db.tasks
      .where('date')
      .equals(dayStart)
      .toArray();

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].order !== newOrder[i]) {
        await db.tasks.update(tasks[i].id!, { order: newOrder[i], updatedAt: Date.now() });
      }
    }
  });
}

// Delete a task
export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);
}

// Get tasks for a date range
export async function getTasksInDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
  const start = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);

  return await db.tasks
    .where('date')
    .between(start, end, true, true)
    .toArray()
    .then(tasks => tasks.sort((a, b) => {
      // First, sort by date
      if (a.date !== b.date) {
        return a.date - b.date;
      }
      // If dates are the same, sort by order
      return a.order - b.order;
    }));
}