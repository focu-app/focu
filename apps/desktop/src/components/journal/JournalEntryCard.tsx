import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { JournalEntry } from "../../database/db";
import { cn } from "@repo/ui/lib/utils";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
  isActive?: boolean;
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
  isActive = false,
}: JournalEntryCardProps) {
  // Extract a preview from the content
  const getPreview = (content: string): string => {
    // Strip HTML tags
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    // Limit to around 120 characters
    return textContent.length > 120
      ? `${textContent.substring(0, 120)}...`
      : textContent;
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        isActive && "border-primary shadow-sm",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{entry.title}</CardTitle>
        <CardDescription>
          {entry.createdAt &&
            formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {getPreview(entry.content)}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex gap-1 flex-wrap">
          {entry.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (entry.id) onDelete(entry.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
