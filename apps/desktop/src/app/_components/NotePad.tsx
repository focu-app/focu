import { getNotesForDay } from "@/database/notes";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useLiveQuery } from "dexie-react-hooks";
import type React from "react";
import { useCallback, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useNoteStore } from "../store/noteStore";

export function NotePad() {
  const { addNote, updateNote } = useNoteStore();
  const { selectedDate } = useChatStore();

  const notes =
    useLiveQuery(async () => {
      return getNotesForDay(new Date(selectedDate || ""));
    }, [selectedDate]) || [];

  const note = notes[0];

  const handleNotesChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      console.log(event.target.value);
      updateNote({
        id: note?.id,
        text: event.target.value,
        date: new Date(selectedDate || "").setHours(0, 0, 0, 0),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
    [updateNote, selectedDate, note],
  );

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Notes</h3>
      <Textarea
        value={note?.text || ""}
        onFocus={() => {
          if (!note) {
            addNote("");
          }
        }}
        onChange={handleNotesChange}
        placeholder="Write your notes for today here..."
        className="w-full h-40"
      />
    </div>
  );
}
