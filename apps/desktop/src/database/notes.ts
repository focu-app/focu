import { db } from "./db";
import type { Note } from "./db";

export async function addNote(note: Note): Promise<void> {
  await db.notes.add(note);
}

export async function updateNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function getNotesForDay(date: Date): Promise<Note[]> {
  return db.notes
    .where("date")
    .equals(date.setHours(0, 0, 0, 0))
    .toArray();
}
