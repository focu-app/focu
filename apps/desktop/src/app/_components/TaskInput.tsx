"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useEffect, useRef, useState } from "react";

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
    setIsAdding(true);
  };
  return (
    <div className="w-full">
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
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
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
