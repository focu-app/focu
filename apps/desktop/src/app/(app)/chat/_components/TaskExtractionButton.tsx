import { Button } from "@repo/ui/components/ui/button";
import { ClipboardList } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";

export function TaskExtractionButton({ chatId }: { chatId: number }) {
  const { extractTasks } = useChatStore();

  const handleExtractTasks = async () => {
    const tasks = await extractTasks(chatId);
    if (tasks) {
      console.log("Tasks:", tasks);
    }
  };

  return (
    <Button onClick={handleExtractTasks} variant="outline" size="sm">
      <ClipboardList className="h-4 w-4 mr-2" />
      Extract Tasks
    </Button>
  );
}
