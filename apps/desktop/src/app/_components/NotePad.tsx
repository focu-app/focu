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
      return getNotesForDay(
        new Date(
          `${selectedDate || new Date().toISOString().split("T")[0]}T00:00:00`,
        ),
      );
    }, [selectedDate]) || [];

  const note = notes[0];

  const handleNotesChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNote({
        id: note?.id,
        text: event.target.value,
        dateString: selectedDate || new Date().toISOString().split("T")[0],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
    [updateNote, selectedDate, note],
  );

  return (
    <div>
      <Textarea
        value={note?.text || ""}
        onFocus={() => {
          if (!note) {
            addNote("");
          }
        }}
        onChange={handleNotesChange}
        placeholder="Write your notes for today here... Saves automatically"
        className="w-full h-40"
      />
    </div>
  );
}
