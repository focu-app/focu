"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

interface TaskInputProps {
  addTask: (task: string) => void;
}

export function TaskInput({ addTask }: TaskInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
    setIsAdding(false);
  };

  return (
    <div className="mt-4">
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)}>Add Task</Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex">
          <Input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 mr-2"
            placeholder="Add a new task..."
          />
          <Button type="submit">Add</Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
