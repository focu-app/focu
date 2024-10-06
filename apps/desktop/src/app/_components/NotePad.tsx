import React, { useCallback, useEffect } from "react";
import { useChatStoreOld } from "../store/chatStoreOld";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useNoteStore } from "../store/noteStore";
import { useLiveQuery } from "dexie-react-hooks";
import { getNotesForDay } from "@/database/notes";

export function NotePad() {
  const { addNote, updateNote } = useNoteStore();
  const { selectedDate } = useChatStoreOld();

  const notes =
    useLiveQuery(async () => {
      return getNotesForDay(new Date(selectedDate));
    }, [selectedDate]) || [];

  const note = notes[0];

  const handleNotesChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      console.log(event.target.value);
      updateNote({
        id: note?.id,
        text: event.target.value,
        date: new Date(selectedDate).setHours(0, 0, 0, 0),
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
