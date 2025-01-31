import { useOllamaStore } from "@/app/store/ollamaStore";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDown, Zap } from "lucide-react";
import type React from "react";

export const REFLECTION_MENU_OPTIONS = [
  {
    label: "Create Summary",
    message: "Create a concise summary of our reflection.",
  },

  {
    label: "Extract Insights",
    message:
      "Extract 3-5 key insights by connecting patterns between past experiences and future intentions.",
  },
  {
    label: "Create Highlights",
    message: "Create a brief, quotable version of the reflection.",
  },
  {
    label: "Suggest Next Steps",
    message: "Suggest 3-5 next steps to take based on the reflection.",
  },
];

interface ReflectionMenuProps {
  chatId: number;
}

export const ReflectionMenu: React.FC<ReflectionMenuProps> = ({ chatId }) => {
  const { sendChatMessage, replyLoading } = useChatStore();
  const { isOllamaRunning } = useOllamaStore();

  const handleQuickAction = (message: string) => {
    sendChatMessage(chatId, message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={replyLoading || !isOllamaRunning}
        >
          <Zap className="h-4 w-4 mr-2" />
          Actions <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {REFLECTION_MENU_OPTIONS.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handleQuickAction(option.message)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
