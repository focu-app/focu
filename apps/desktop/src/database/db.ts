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

// Types
interface EmotionCategory {
  id: string;
  label: string;
  emoji: string;
  options: EmotionOption[];
}

interface EmotionOption {
  id: string;
  label: string;
  emoji: string;
}

export const emotionCategories: EmotionCategory[] = [
  {
    id: "mood",
    label: "Mood",
    emoji: "🎭",
    options: [
      { id: "happy", label: "Happy", emoji: "😊" },
      { id: "sad", label: "Sad", emoji: "😢" },
      { id: "calm", label: "Calm", emoji: "😌" },
      { id: "anxious", label: "Anxious", emoji: "😰" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    emoji: "⚡",
    options: [
      { id: "energetic", label: "Energetic", emoji: "⚡" },
      { id: "tired", label: "Tired", emoji: "😴" },
      { id: "focused", label: "Focused", emoji: "🎯" },
      { id: "scattered", label: "Scattered", emoji: "🌪" },
    ],
  },
  {
    id: "work-state",
    label: "Work State",
    emoji: "💼",
    options: [
      { id: "productive", label: "Productive", emoji: "📈" },
      { id: "stuck", label: "Stuck", emoji: "🚧" },
      { id: "overwhelmed", label: "Overwhelmed", emoji: "🌊" },
      { id: "motivated", label: "Motivated", emoji: "🚀" },
    ],
  },
];

export interface CheckIn extends TimeStamped {
  id?: number;
  date?: number;
  emotions: {
    categoryId: string;
    selectedOptions: string[];
  }[];
  intensity?: number; // Optional 1-5 scale for strongest emotion
  note?: string; // Optional quick note
}


export class FocuDB extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;
  chats!: Table<Chat, number>;
  messages!: Table<Message, number>;
  checkIns!: Table<CheckIn, number>;

  constructor() {
    super("focu-db");

    this.version(2).stores({
      tasks: "++id, date, order, completed, text, createdAt, updatedAt",
      notes: "++id, date, text, createdAt, updatedAt",
      chats: "++id, date, title, type, model, createdAt, updatedAt",
      messages: "++id, chatId, text, role, createdAt, updatedAt",
      checkIns: "++id, date, createdAt, updatedAt",
    });
  }
}

export const db = new FocuDB();

for (const table of db.tables) {
  table.hook("creating", (primaryKey, obj) => {
    obj.createdAt = obj.createdAt ?? new Date().getTime();
    obj.updatedAt = obj.updatedAt ?? new Date().getTime();
    obj.date = obj.date ?? new Date().setHours(0, 0, 0, 0);
  });

  table.hook(
    "updating",
    (modifications: any, primKey, obj: any, transaction) => {
      obj.updatedAt = new Date().getTime();
    },
  );
}
