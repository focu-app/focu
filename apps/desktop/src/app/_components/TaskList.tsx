"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
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
import { getTasksForDay } from "@/database/tasks";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskItem } from "./SortableTaskItem";
import { TaskItem } from "./TaskItem";
import { Task } from "@/database/db";

export function TaskList() {
  const { toast } = useToast();
  const { selectedDate } = useChatStore();
  const {
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearTasks,
    clearFinishedTasks,
    copyTasksFromPreviousDay,
    copyTasksToNextDay,
    reorderTasks,
  } = useTaskStore();

  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const fetchedTasks = await getTasksForDay(new Date(selectedDate));
    setTasks(fetchedTasks);
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over?.id);

        const newTasks = arrayMove(tasks, oldIndex, newIndex);

        // Separate completed and uncompleted tasks
        const uncompletedTasks = newTasks.filter((task) => !task.completed);
        const completedTasks = newTasks.filter((task) => task.completed);

        // Reorder uncompleted tasks
        const reorderedUncompletedTasks = uncompletedTasks.map(
          (task, index) => ({
            ...task,
            order: index,
          }),
        );

        // Keep completed tasks at the end
        const reorderedCompletedTasks = completedTasks.map((task, index) => ({
          ...task,
          order: reorderedUncompletedTasks.length + index,
        }));

        // Combine and reorder all tasks
        const reorderedTasks = [
          ...reorderedUncompletedTasks,
          ...reorderedCompletedTasks,
        ];

        // Immediately update the state
        setTasks(reorderedTasks);

        // Reorder tasks in the store
        await reorderTasks(reorderedTasks);

        // Fetch tasks after a 250ms delay
        setTimeout(() => {
          fetchTasks();
        }, 250);
      }
    },
    [tasks, reorderTasks, fetchTasks, setTasks],
  );

  const handleSubmit = async (task: string) => {
    await addTask(task);
    await fetchTasks(); // Fetch tasks after adding a new one
    toast({
      title: "Task added",
      description: `"${task}" has been added to your list.`,
    });
  };

  const handleUndo = (title: string, description: string) => {
    // Implement undo functionality
    toast({ title, description });
  };

  const handleCopyFromPrevious = async () => {
    await copyTasksFromPreviousDay();
    await fetchTasks(); // Fetch tasks after copying from previous day
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks from yesterday have been copied.",
    });
  };

  const handleCopyToNext = async () => {
    await copyTasksToNextDay();
    await fetchTasks(); // Fetch tasks after copying to next day
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks have been copied to tomorrow.",
    });
  };

  const handleClearTasks = async () => {
    await clearTasks(selectedDate);
    await fetchTasks(); // Fetch tasks after clearing all tasks
    toast({
      title: "Tasks cleared",
      description: "All tasks for today have been removed.",
      variant: "destructive",
    });
  };

  const handleToggleTask = useCallback(
    async (id: number) => {
      await toggleTask(id);
      await fetchTasks(); // Refetch tasks after toggling
    },
    [toggleTask, fetchTasks],
  );

  const handleRemoveTask = useCallback(
    async (id: number) => {
      await removeTask(id);
      await fetchTasks(); // Refetch tasks after removing
      toast({
        title: "Task removed",
        description: "The task has been removed from your list.",
      });
    },
    [removeTask, fetchTasks, toast],
  );

  const handleEditTask = async (id: number, newText: string) => {
    await editTask(id, newText);
    await fetchTasks(); // Fetch tasks after editing
    toast({
      title: "Task updated",
      description: "The task has been updated successfully.",
    });
  };

  const handleClearFinishedTasks = async () => {
    await clearFinishedTasks(selectedDate);
    await fetchTasks(); // Fetch tasks after clearing finished ones
    toast({
      title: "Finished tasks cleared",
      description: "All completed tasks for today have been removed.",
      variant: "default",
    });
  };

  // Categorize tasks
  const unfinishedTasks = tasks.filter((task) => !task.completed);
  const finishedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={unfinishedTasks.map((task) => task.id ?? "")}
            strategy={verticalListSortingStrategy}
          >
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

              {unfinishedTasks.length > 0 ? (
                <SortableTaskItem
                  key={unfinishedTasks[0].id}
                  task={unfinishedTasks[0]}
                  onToggle={handleToggleTask}
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
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
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
          </SortableContext>

          {/* Done Section */}
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
                    onToggle={handleToggleTask}
                    onRemove={handleRemoveTask}
                    onEdit={handleEditTask}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No tasks completed yet.</p>
            )}
          </div>
        </DndContext>

        <div className="flex justify-center">
          <TaskInput addTask={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
