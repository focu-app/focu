import { db } from "./db";
import type { Note } from "./db";

export async function addNote(note: Note): Promise<void> {
  await db.notes.add(note);
}

export async function updateNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function getNotesForDay(dateString: string): Promise<Note[]> {
  return db.notes.where("dateString").equals(dateString).toArray();
}
