import { format } from "date-fns";
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
  dateString: string;
}

export interface Note extends TimeStamped {
  id?: number;
  text: string;
  dateString: string;
}

export type ChatType = "general" | "morning" | "evening" | "year-end";

export interface Chat extends TimeStamped {
  id?: number;
  type: ChatType;
  model: string;
  provider?: string;
  title?: string;
  summary?: string;
  summaryCreatedAt?: number;
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
export interface EmotionCategory {
  id: string;
  label: string;
  emoji: string;
  options: EmotionOption[];
}

export interface EmotionOption {
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
  chatId?: number; // Optional reference to a chat session
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

    this.version(14).stores({
      tasks: "++id, dateString, order, completed, text, createdAt, updatedAt",
      notes: "++id, dateString, text, createdAt, updatedAt",
      chats:
        "++id, dateString, title, type, model, summary, summaryCreatedAt, createdAt, updatedAt",
      messages: "++id, chatId, text, role, createdAt, updatedAt",
      checkIns: "++id, date, createdAt, updatedAt",
      reflections: "++id, year, type, chatId, createdAt, updatedAt",
    });

    // We need to keep this code for now to migrate the data from version <10 and below
    // It does seem that this might cause some users to lose their data, unclear why
    // More reading: https://dexie.org/docs/Tutorial/Design#database-versioning
    this.version(11).upgrade((tx) => {
      return Promise.all([
        tx
          .table("chats")
          .toCollection()
          .modify((chat) => {
            if (chat.date) {
              const date = new Date(chat.date);

              const dateString = format(new Date(date), "yyyy-MM-dd");
              chat.dateString = dateString;
              chat.date = undefined;
            }
          }),
        tx
          .table("tasks")
          .toCollection()
          .modify((task) => {
            if (task.date) {
              const date = new Date(task.date);
              const dateString = format(new Date(date), "yyyy-MM-dd");
              task.dateString = dateString;
              task.date = undefined;
            }
          }),
        tx
          .table("notes")
          .toCollection()
          .modify((note) => {
            if (note.date) {
              const date = new Date(note.date);
              const dateString = format(new Date(date), "yyyy-MM-dd");
              note.dateString = dateString;
              note.date = undefined;
            }
          }),
      ]);
    });
  }
}

export const db = new FocuDB();

for (const table of db.tables) {
  table.hook("creating", (primaryKey, obj: any) => {
    obj.createdAt = obj.createdAt ?? new Date().getTime();
    obj.updatedAt = obj.updatedAt ?? new Date().getTime();
    if (!obj.dateString) {
      obj.dateString = format(new Date(), "yyyy-MM-dd");
    }
  });

  table.hook(
    "updating",
    (modifications: any, primKey, obj: any, transaction) => {
      obj.updatedAt = new Date().getTime();
    },
  );
}
