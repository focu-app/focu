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
      <div className="flex flex-col justify-between">
        <h2 className="text-lg font-semibold mb-4">Tasks</h2>
        <ul className="space-y-2">
          {currentTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onRemove={removeTask}
            />
          ))}
        </ul>
      </div>
      <div className="flex justify-center my-4">
        <TaskInput addTask={handleSubmit} />
      </div>
    </div>
  );
}
