import Dexie, { type Table } from 'dexie';

export interface TimeStamped {
  createdAt: number;
  updatedAt: number;
}

export interface Task extends TimeStamped {
  id?: number;
  text: string;
  completed: boolean;
  order: number;
  date: number;
}

export interface Note extends TimeStamped {
  id?: number;
  text: string;
  date: number;
}

export class FocuDB extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;
  constructor() {
    super('focu-db');

    this.version(1).stores({
      tasks: '++id, date, order, completed, text, createdAt, updatedAt',
      notes: '++id, date, text, createdAt, updatedAt',
    });
  }
}

export const db = new FocuDB();