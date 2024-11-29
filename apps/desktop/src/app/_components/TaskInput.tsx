"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useTaskStore } from "../store/taskStore";

export function TaskInput({ addTask }: { addTask: (task: string) => void }) {
  const { showTaskInput, setShowTaskInput } = useTaskStore();
  const [newTask, setNewTask] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTaskInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTaskInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
  };

  return (
    <div className="w-full">
      {!showTaskInput ? (
        <Button onClick={() => setShowTaskInput(true)} className="w-full">
          Add Task
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-row">
          <Input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 mr-2"
            placeholder="Add a new task..."
          />
          <Button type="submit">Add</Button>
          <Button variant="ghost" onClick={() => setShowTaskInput(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
