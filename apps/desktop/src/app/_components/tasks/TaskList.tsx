"use client";
import type { Task } from "@/database/db";
import { getTasksForDay } from "@/database/tasks";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useToast } from "@repo/ui/hooks/use-toast";
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useChatStore } from "../../../store/chatStore";
import { useTaskStore } from "../../../store/taskStore";
import { SortableTaskItem } from "./SortableTaskItem";
import { TaskInput } from "./TaskInput";

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
    if (!selectedDate) {
      return;
    }
    const fetchedTasks = await getTasksForDay(selectedDate);
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
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over?.id);

        let newTasks = arrayMove(tasks, oldIndex, newIndex);

        // Check if the task's completion status needs to be toggled
        const activeTask = tasks[oldIndex];
        const overTask = tasks[newIndex];
        if (activeTask.completed !== overTask.completed) {
          newTasks = newTasks.map((task) =>
            task.id === activeTask.id
              ? { ...task, completed: !task.completed }
              : task,
          );
          await toggleTask(activeTask.id!);
        }

        // Reorder tasks
        const reorderedTasks = newTasks.map((task, index) => ({
          ...task,
          order: index,
        }));

        // Immediately update the state
        setTasks(reorderedTasks);

        // Reorder tasks in the store
        await reorderTasks(reorderedTasks);

        // Fetch tasks after a short delay
        setTimeout(() => {
          fetchTasks();
        }, 250);
      }
    },
    [tasks, reorderTasks, fetchTasks, toggleTask],
  );

  const handleSubmit = async (task: string) => {
    await addTask(task);
    await fetchTasks();
  };

  const handleUndo = (title: string, description: string) => {
    toast({ title, description });
  };

  const handleCopyFromPrevious = async () => {
    await copyTasksFromPreviousDay();
    await fetchTasks();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks from yesterday have been copied.",
    });
  };

  const handleCopyToNext = async () => {
    await copyTasksToNextDay();
    await fetchTasks();
    toast({
      title: "Tasks copied",
      description: "Uncompleted tasks have been copied to tomorrow.",
    });
  };

  const handleClearTasks = async () => {
    if (!selectedDate) return;
    await clearTasks(selectedDate);
    await fetchTasks();
    toast({
      title: "Tasks cleared",
      description: "All tasks for today have been removed.",
      variant: "destructive",
    });
  };

  const handleToggleTask = useCallback(
    async (id: number) => {
      await toggleTask(id);
      await fetchTasks();
    },
    [toggleTask, fetchTasks],
  );

  const handleRemoveTask = useCallback(
    async (id: number) => {
      await removeTask(id);
      await fetchTasks();
    },
    [removeTask, fetchTasks],
  );

  const handleEditTask = async (id: number, newText: string) => {
    await editTask(id, newText);
    await fetchTasks();
  };

  const handleClearFinishedTasks = async () => {
    if (!selectedDate) return;
    await clearFinishedTasks(selectedDate);
    await fetchTasks();
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
            items={tasks.map((task) => task.id ?? "")}
            strategy={verticalListSortingStrategy}
          >
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
                <p className="text-sm text-gray-500">Add your first task.</p>
              )}
            </div>

            {unfinishedTasks.length > 1 && (
              <div>
                <h2 className="text-lg font-semibold">Next</h2>

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
              </div>
            )}
            <div className="flex justify-center">
              <TaskInput addTask={handleSubmit} />
            </div>

            {finishedTasks.length > 0 && (
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
                <ul className="space-y-2">
                  {finishedTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onRemove={handleRemoveTask}
                      onEdit={handleEditTask}
                    />
                  ))}
                </ul>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
