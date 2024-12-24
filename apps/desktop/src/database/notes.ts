import { db } from "./db";
import type { Note } from "./db";

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export async function addNote(note: Note): Promise<void> {
  await db.notes.add(note);
}

export async function updateNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function getNotesForDay(date: Date): Promise<Note[]> {
  return db.notes
    .where("dateString")
    .equals(getDateString(date))
    .toArray();
}
