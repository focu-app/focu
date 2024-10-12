import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { useChatStore } from "@/app/store/chatStore";
import { useTaskStore } from "@/app/store/taskStore";

interface TaskExtractionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
}

export function TaskExtractionDialog({
  isOpen,
  onClose,
  chatId,
}: TaskExtractionDialogProps) {
  const { extractTasks } = useChatStore();
  const { addMultipleTasks } = useTaskStore();
  const [extractedTasks, setExtractedTasks] = useState<
    { task: string; selected: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tasksAdded, setTasksAdded] = useState(false);

  const handleToggleTask = (index: number) => {
    setExtractedTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, selected: !task.selected } : task,
      ),
    );
  };

  const handleAddTasks = async () => {
    const selectedTasks = extractedTasks
      .filter((t) => t.selected)
      .map((t) => t.task);
    await addMultipleTasks(selectedTasks);
    setTasksAdded(true);
  };

  useEffect(() => {
    const handleExtractTasks = async () => {
      setIsLoading(true);
      const tasks = await extractTasks(chatId);
      if (tasks) {
        setExtractedTasks(tasks.map((t) => ({ ...t, selected: true })));
      }
      setIsLoading(false);
    };

    if (isOpen) {
      handleExtractTasks();
      setTasksAdded(false);
    }
  }, [isOpen, chatId, extractTasks]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extract Tasks</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4">Extracting tasks...</div>
        ) : tasksAdded ? (
          <div className="py-4">Tasks added successfully!</div>
        ) : (
          <div className="py-4">
            {extractedTasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`task-${index}`}
                  checked={task.selected}
                  onCheckedChange={() => handleToggleTask(index)}
                />
                <label
                  htmlFor={`task-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {task.task}
                </label>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          {!tasksAdded ? (
            <>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleAddTasks}
                disabled={isLoading || extractedTasks.length === 0}
              >
                Add Selected Tasks
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button asChild>
                <Link href="/focus">Go to Tasks</Link>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
