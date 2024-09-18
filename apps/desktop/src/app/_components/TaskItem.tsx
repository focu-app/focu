"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
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
      <Button variant="ghost" onClick={() => onRemove(task.id)}>
        <Trash2 size={16} />
      </Button>
    </li>
  );
}
