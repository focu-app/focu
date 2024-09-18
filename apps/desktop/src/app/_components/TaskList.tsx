"use client";
import { useTaskStore } from "../store/taskStore";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput"; // Add this import

export function TaskList() {
  const { tasks, addTask, toggleTask, removeTask, selectedDate } =
    useTaskStore();

  const handleSubmit = (task: string) => {
    addTask(task);
  };

  const currentTasks = tasks[selectedDate] || [];

  return (
    <div className="p-4">
      <ul className="space-y-2">
        {currentTasks
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onRemove={removeTask}
            />
          ))}
      </ul>
      <TaskInput addTask={handleSubmit} />
    </div>
  );
}
