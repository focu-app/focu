import { format } from "date-fns";
import { db } from "./db";
import type { Task } from "./db";

export async function addTask(task: Omit<Task, "id">): Promise<number> {
  return await db.tasks.add(task);
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function getTasksForDay(dateString: string): Promise<Task[]> {
  return await db.tasks.where("dateString").equals(dateString).sortBy("order");
}

export async function getIncompleteTasks(): Promise<Task[]> {
  const today = format(new Date(), "yyyy-MM-dd");
  return await db.tasks
    .where("dateString")
    .equals(today)
    .and((task) => !task.completed)
    .sortBy("order");
}

export async function updateTaskCompletion(
  id: number,
  completed: boolean,
): Promise<void> {
  await db.tasks.update(id, { completed, updatedAt: Date.now() });
}

export async function reorderTasks(
  date: Date,
  newOrder: number[],
): Promise<void> {
  const dateString = format(date, "yyyy-MM-dd");

  await db.transaction("rw", db.tasks, async () => {
    const tasks = await db.tasks.where("dateString").equals(dateString).toArray();

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].order !== newOrder[i]) {
        await db.tasks.update(tasks[i].id!, {
          order: newOrder[i],
          updatedAt: Date.now(),
        });
      }
    }
  });
}

// Delete a task
export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);
}

// Update a task
export async function updateTask(
  id: number,
  updates: Partial<Task>,
): Promise<void> {
  await db.tasks.update(id, { ...updates, updatedAt: Date.now() });
}

export async function updateTaskOrder(
  id: number,
  newOrder: number,
): Promise<void> {
  await db.tasks.update(id, { order: newOrder, updatedAt: Date.now() });
}

export async function bulkUpdateTaskOrder(tasks: Task[]): Promise<void> {
  await db.transaction("rw", db.tasks, async () => {
    for (const task of tasks) {
      if (task.id !== undefined) {
        await db.tasks.update(task.id, {
          order: task.order,
          updatedAt: Date.now(),
        });
      }
    }
  });
}
