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
  ClipboardCheck,
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
    clearFinishedTasks, // Add this new function
  } = useTaskStore();
  const { selectedDate } = useChatStore();
  const { toast } = useToast();
  const { undo } = useTaskStore.temporal.getState();

  const handleSubmit = (task: string) => {
    addTask(task);
    toast({
      title: "Task added",
      description: `"${task}" has been added to your list.`,
    });
  };

  const handleUndo = (title: string, description: string) => {
    undo();
    toast({ title, description });
  };

  const handleCopyFromPrevious = () => {
    copyTasksFromPreviousDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks from yesterday have been copied.",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo("Copy undone", "Yesterday's tasks have been removed.")
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const handleCopyToNext = () => {
    copyTasksToNextDay();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks have been copied to tomorrow.",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo(
              "Copy undone",
              "Tasks copied to tomorrow have been removed.",
            )
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const handleClearTasks = () => {
    clearTasks(selectedDate);
    toast({
      title: "Tasks cleared",
      description: "All tasks for today have been removed.",
      variant: "destructive",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo("Clear undone", "Today's tasks have been restored.")
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const handleRemoveTask = (id: string) => {
    const removedTask = removeTask(id);
    toast({
      title: "Task removed",
      description: "The task has been removed from your list.",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo("Remove undone", "The removed task has been restored.")
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const handleEditTask = (id: string, newText: string) => {
    const oldText = editTask(id, newText);
    toast({
      title: "Task updated",
      description: "The task has been updated successfully.",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo(
              "Edit undone",
              "The task has been reverted to its previous state.",
            )
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const handleClearFinishedTasks = () => {
    clearFinishedTasks(selectedDate);
    toast({
      title: "Finished tasks cleared",
      description: "All completed tasks for today have been removed.",
      variant: "default",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() =>
            handleUndo(
              "Clear finished tasks undone",
              "Completed tasks have been restored.",
            )
          }
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const currentTasks = tasks[selectedDate] || [];

  // Categorize tasks
  const unfinishedTasks = currentTasks.filter((task) => !task.completed);
  const finishedTasks = currentTasks.filter((task) => task.completed);
  const topTask = unfinishedTasks[0]; // Top unfinished task

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between gap-4">
        {/* Focus Section */}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Focus</h2>
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
                <DropdownMenuItem onClick={handleClearFinishedTasks}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Clear finished tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearTasks}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {topTask ? (
            <TaskItem
              key={topTask.id}
              task={topTask}
              onToggle={toggleTask}
              onRemove={handleRemoveTask}
              onEdit={handleEditTask}
            />
          ) : (
            <p className="text-sm text-gray-500">No unfinished tasks.</p>
          )}
        </div>

        {/* Next Section */}
        <div>
          <h2 className="text-lg font-semibold">Next</h2>
          {unfinishedTasks.length > 1 ? (
            <ul className="space-y-1">
              {unfinishedTasks.slice(1).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onRemove={handleRemoveTask}
                  onEdit={handleEditTask}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No additional unfinished tasks.
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <TaskInput addTask={handleSubmit} />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Done</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClearFinishedTasks}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Clear finished tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {finishedTasks.length > 0 ? (
            <ul className="space-y-2">
              {finishedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onRemove={handleRemoveTask}
                  onEdit={handleEditTask}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No tasks completed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
