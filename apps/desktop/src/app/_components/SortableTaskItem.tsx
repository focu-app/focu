import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/database/db";

interface SortableTaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

export function SortableTaskItem({
  task,
  onToggle,
  onRemove,
  onEdit,
}: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id!,
      transition: {
        duration: 500,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem
        task={task}
        onToggle={onToggle}
        onRemove={onRemove}
        onEdit={onEdit}
      />
    </div>
  );
}
