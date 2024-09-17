"use client";

import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Button } from "@repo/ui/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Task } from "../store/taskStore";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskItem({ task, onToggle, onRemove }: TaskItemProps) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mr-2"
        />
        <span className={task.completed ? "line-through" : ""}>
          {task.text}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onRemove(task.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
