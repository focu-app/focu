"use client";
import { useTaskStore } from "../store/taskStore";
import { TaskItem } from "./TaskItem";
import { TaskInput } from "./TaskInput";
import { useChatStore } from "../store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function TaskList() {
  const {
    tasks,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    copyTasksFromPreviousDay,
    copyTasksToNextDay,
    clearTasks,
  } = useTaskStore();
  const { selectedDate } = useChatStore();

  const handleSubmit = (task: string) => {
    addTask(task);
  };

  const currentTasks = tasks[selectedDate] || [];

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyTasksFromPreviousDay}>
                <ChevronsLeft className="mr-2 h-4 w-4" />
                Copy tasks from Yesterday
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyTasksToNextDay}>
                <ChevronsRight className="mr-2 h-4 w-4" />
                Copy tasks to Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => clearTasks(selectedDate)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              onEdit={editTask}
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
