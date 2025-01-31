import type { Note } from "@/database/db";
import { addNote, updateNote } from "@/database/notes";
import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./chatStore";

export interface NoteState {
  addNote: (text: string) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
}

export const useNoteStore = create<NoteState>()(
  persist(
    temporal(
      (set, get) => ({
        addNote: async (text: string) => {
          const { selectedDate } = useChatStore.getState();
          if (!selectedDate) return;
          const newNote: Note = {
            text,
            dateString: selectedDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await addNote(newNote);
        },
        updateNote: async (note: Note) => {
          await updateNote(note);
        },
      }),
      { limit: 10 },
    ),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
