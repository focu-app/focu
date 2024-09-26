"use client";
import { useTaskStore } from "../store/taskStore";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput";
import { useChatStore } from "../store/chatStore";
import { Button } from "@repo/ui/components/ui/button";

export function TaskList() {
  const {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    copyTasksFromPreviousDay,
    copyTasksToNextDay,
  } = useTaskStore();
  const { selectedDate } = useChatStore();

  const handleSubmit = (task: string) => {
    addTask(task);
  };

  const currentTasks = tasks[selectedDate] || [];

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between">
        <h2 className="text-lg font-semibold mb-4">Tasks</h2>
        <div className="flex justify-between mb-4">
          <Button
            onClick={copyTasksFromPreviousDay}
            variant="outline"
            size="sm"
          >
            Copy tasks from Yesterday
          </Button>
          <Button onClick={copyTasksToNextDay} variant="outline" size="sm">
            Copy tasks to Tomorrow
          </Button>
        </div>
        <ul className="space-y-2">
          {currentTasks.length === 0 && (
            <p className="text-sm text-gray-500">
              No tasks added for today yet.
            </p>
          )}
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
