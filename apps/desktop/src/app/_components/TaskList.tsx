import { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export function TaskList() {
  const { tasks, addTask, toggleTask, removeTask } = useTaskStore();
  const [newTask, setNewTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask("");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 mr-2"
            placeholder="Add a new task..."
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mr-2"
              />
              <span className={task.completed ? "line-through" : ""}>
                {task.text}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
