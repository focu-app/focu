import Dexie, { type Table } from "dexie";

export interface TimeStamped {
  createdAt?: number;
  updatedAt?: number;
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

export type ChatType = "general" | "morning" | "evening";

export interface Chat extends TimeStamped {
  id?: number;
  type: ChatType;
  model: string;
  title?: string;
  messages?: Message[];
  date: number;
}

export interface Message extends TimeStamped {
  id?: number;
  text: string;
  role: "user" | "assistant" | "system";
  chatId: number;
  hidden?: boolean;
}

export class FocuDB extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;
  chats!: Table<Chat, number>;
  messages!: Table<Message, number>;

  constructor() {
    super("focu-db");

    this.version(1).stores({
      tasks: "++id, date, order, completed, text, createdAt, updatedAt",
      notes: "++id, date, text, createdAt, updatedAt",
      chats: "++id, messages, title, createdAt, updatedAt",
      messages: "++id, chatId, text, role, createdAt, updatedAt",
    });
  }
}

export const db = new FocuDB();

for (const table of db.tables) {
  table.hook("creating", (primaryKey, obj) => {
    obj.createdAt = obj.createdAt ?? new Date().getTime();
    obj.updatedAt = obj.updatedAt ?? new Date().getTime();
  });

  table.hook(
    "updating",
    (modifications: any, primKey, obj: any, transaction) => {
      obj.updatedAt = new Date().getTime();
    },
  );
}
