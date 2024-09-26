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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ToastAction } from "@repo/ui/components/ui/toast";

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
    const previousTasks = copyTasksFromPreviousDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks from yesterday have been copied.",
      action: (
        <ToastAction altText="Undo" onClick={() => clearTasks(selectedDate)}>
          Undo
        </ToastAction>
      ),
    });
  };

  const handleCopyToNext = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split("T")[0];
    const copiedTasks = copyTasksToNextDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks have been copied to tomorrow.",
      action: (
        <ToastAction altText="Undo" onClick={() => clearTasks(nextDateString)}>
          Undo
        </ToastAction>
      ),
    });
  };

  const handleClearTasks = () => {
    const clearedTasks = clearTasks(selectedDate);
    toast({
      title: "Tasks cleared",
      description: "All tasks for today have been removed.",
      variant: "destructive",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            clearedTasks.forEach((task) => addTask(task.text));
          }}
        >
          Undo
        </ToastAction>
      ),
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
                const removedTask = removeTask(id);
                toast({
                  title: "Task removed",
                  description: "The task has been removed from your list.",
                  action: (
                    <ToastAction
                      altText="Undo"
                      onClick={() => addTask(removedTask.text)}
                    >
                      Undo
                    </ToastAction>
                  ),
                });
              }}
              onEdit={(id, newText) => {
                const oldText = editTask(id, newText);
                toast({
                  title: "Task updated",
                  description: "The task has been updated successfully.",
                  action: (
                    <ToastAction
                      altText="Undo"
                      onClick={() => editTask(id, oldText)}
                    >
                      Undo
                    </ToastAction>
                  ),
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
