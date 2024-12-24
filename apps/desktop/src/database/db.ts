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

export type ChatType = "general" | "morning" | "evening" | "year-end";

export interface Chat extends TimeStamped {
  id?: number;
  type: ChatType;
  model: string;
  title?: string;
  messages?: Message[];
  dateString: string;
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
      // Positive moods
      { id: "happy", label: "Happy", emoji: "😊" },
      { id: "calm", label: "Calm", emoji: "😌" },
      { id: "grateful", label: "Grateful", emoji: "🙏" },
      // Challenging moods
      { id: "sad", label: "Sad", emoji: "😢" },
      { id: "anxious", label: "Anxious", emoji: "😰" },
      { id: "frustrated", label: "Frustrated", emoji: "😤" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    emoji: "⚡",
    options: [
      // High/positive energy
      { id: "energetic", label: "Energetic", emoji: "⚡" },
      { id: "focused", label: "Focused", emoji: "🎯" },
      { id: "motivated", label: "Motivated", emoji: "🚀" },
      // Low/challenging energy
      { id: "tired", label: "Tired", emoji: "😴" },
      { id: "scattered", label: "Scattered", emoji: "🌪" },
      { id: "drained", label: "Drained", emoji: "🪫" },
    ],
  },
  {
    id: "work",
    label: "Work State",
    emoji: "💼",
    options: [
      // Positive states
      { id: "productive", label: "Productive", emoji: "📈" },
      { id: "creative", label: "Creative", emoji: "💡" },
      { id: "in-flow", label: "In Flow", emoji: "🌊" },
      // Challenging states
      { id: "stuck", label: "Stuck", emoji: "🚧" },
      { id: "overwhelmed", label: "Overwhelmed", emoji: "😫" },
      { id: "distracted", label: "Distracted", emoji: "🎭" },
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

export interface Reflection extends TimeStamped {
  id?: number;
  year: number;
  type: "yearly" | "monthly";
  pastYear: Record<string, string>;
  yearAhead: Record<string, string>;
  status: "draft" | "finished";
}

export class FocuDB extends Dexie {
  tasks!: Table<Task, number>;
  notes!: Table<Note, number>;
  chats!: Table<Chat, number>;
  messages!: Table<Message, number>;
  checkIns!: Table<CheckIn, number>;
  reflections!: Table<Reflection, number>;

  constructor() {
    super("focu-db");

    this.version(4).stores({
      tasks: "++id, date, order, completed, text, createdAt, updatedAt",
      notes: "++id, date, text, createdAt, updatedAt",
      chats: "++id, dateString, title, type, model, createdAt, updatedAt",
      messages: "++id, chatId, text, role, createdAt, updatedAt",
      checkIns: "++id, date, createdAt, updatedAt",
      reflections: "++id, year, type, chatId, createdAt, updatedAt",
    });

    // Migration from version 3 to 4
    this.version(10).upgrade(tx => {
      return tx.table("chats").toCollection().modify(chat => {
        const date = new Date(chat.date);
        chat.dateString = date.toISOString().split('T')[0];
      });
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
