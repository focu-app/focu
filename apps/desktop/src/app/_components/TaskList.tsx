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
import { useToast } from "@repo/ui/hooks/use-toast";

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
  const { toast } = useToast();

  const handleSubmit = (task: string) => {
    addTask(task);
    toast({
      title: "Task added",
      description: `"${task}" has been added to your list.`,
    });
  };

  const handleCopyFromPrevious = () => {
    copyTasksFromPreviousDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks from yesterday have been copied.",
    });
  };

  const handleCopyToNext = () => {
    copyTasksToNextDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks have been copied to tomorrow.",
    });
  };

  const handleClearTasks = () => {
    clearTasks(selectedDate);
    toast({
      title: "Tasks cleared",
      description: "All tasks for today have been removed.",
      variant: "destructive",
    });
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
              <DropdownMenuItem onClick={handleCopyFromPrevious}>
                <ChevronsLeft className="mr-2 h-4 w-4" />
                Copy tasks from Yesterday
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyToNext}>
                <ChevronsRight className="mr-2 h-4 w-4" />
                Copy tasks to Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearTasks}>
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
              onRemove={(id) => {
                removeTask(id);
                toast({
                  title: "Task removed",
                  description: "The task has been removed from your list.",
                });
              }}
              onEdit={(id, newText) => {
                editTask(id, newText);
                toast({
                  title: "Task updated",
                  description: "The task has been updated successfully.",
                });
              }}
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
