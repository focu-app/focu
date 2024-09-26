"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { Trash2, Check, X } from "lucide-react";
import type { Task } from "../store/taskStore";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
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
    <li className="flex items-center justify-between">
      <div className="flex items-center flex-grow">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mr-2"
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
            className={`flex-grow cursor-pointer ${
              task.completed ? "line-through" : ""
            }`}
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
        <Button variant="ghost" onClick={() => onRemove(task.id)} size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}
