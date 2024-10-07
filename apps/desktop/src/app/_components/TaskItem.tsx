"use client";

import type { Task } from "@/database/db";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Check, GripVertical, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

export function TaskItem({ task, onToggle, onRemove, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (editedText.trim() !== "") {
      onEdit(task.id, editedText);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setEditedText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <li
      className={cn(
        "flex items-center justify-between rounded-md",
        !isEditing
          ? "hover:bg-gray-100 dark:hover:bg-gray-700"
          : "bg-gray-50 dark:bg-gray-900",
      )}
    >
      <div className="flex items-center flex-grow">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id!)}
          className="mx-2"
        />
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow mr-2"
          />
        ) : (
          <span
            className={`flex-grow ${task.completed ? "line-through" : ""}`}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}
      </div>
      {isEditing ? (
        <div>
          <Button variant="ghost" onClick={handleEdit} size="icon">
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setEditedText(task.text);
              setIsEditing(false);
            }}
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => onRemove(task.id)}
          size="icon"
          className="text-gray-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}
