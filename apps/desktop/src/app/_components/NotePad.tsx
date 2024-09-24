import React, { useCallback } from "react";
import { useTaskStore } from "../store/taskStore";
import { useChatStore } from "../store/chatStore";
import { Textarea } from "@repo/ui/components/ui/textarea";

export function NotePad() {
  const { notes, updateNotes } = useTaskStore();
  const { selectedDate } = useChatStore();

  const currentNotes = notes[selectedDate] || "";

  const handleNotesChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNotes(event.target.value);
    },
    [updateNotes],
  );

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Notes</h3>
      <Textarea
        value={currentNotes}
        onChange={handleNotesChange}
        placeholder="Write your notes here..."
        className="w-full h-40"
      />
    </div>
  );
}
