import { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { TaskItem } from "./TaskItem";

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
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onRemove={removeTask}
          />
        ))}
      </ul>
    </div>
  );
}
