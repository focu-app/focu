import { useChatStore } from "@/store/chatStore";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { toast } from "@repo/ui/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  const handleExtractTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = await extractTasks(chatId);
      if (tasks) {
        setExtractedTasks(tasks.map((t) => ({ task: t, selected: true })));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error extracting tasks",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
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
                <Label htmlFor={`task-${index}`}>{task.task}</Label>
              </div>
            ))}
            <Button
              onClick={handleExtractTasks}
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Tasks
            </Button>
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
