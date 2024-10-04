import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { temporal } from 'zundo';
import { useChatStoreOld } from "./chatStoreOld";
import type { Note } from "@/database/db";
import { addNote, getNotesForDay, updateNote } from "@/database/notes";

export interface NoteState {
  addNote: (text: string) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  getNotesForDay: (date: Date) => Promise<Note[]>;
}

export const useNoteStore = create<NoteState>()(
  persist(
    temporal(
      (set, get) => ({
        addNote: async (text: string) => {
          const { selectedDate } = useChatStoreOld.getState();
          const date = new Date(selectedDate);
          const newNote: Note = {
            text,
            date: date.setHours(0, 0, 0, 0),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await addNote(newNote);
        },
        updateNote: async (note: Note) => {
          await updateNote(note);
        },
        getNotesForDay: async (date: Date) => {
          return await getNotesForDay(date);
        },
      }),
      { limit: 10 },
    ),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
