import { useOllamaStore } from "@/app/store";
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
    message: "/summary",
    description: "Create a concise summary of our reflection.",
  },
  {
    label: "Reflection Card",
    message: "/reflection-card",
    description: "Generate a compact reflection card.",
  },
  {
    label: "Extract Insights",
    message: "/insights",
    description:
      "Extract 3-5 key insights by connecting patterns between past experiences and future intentions.",
  },
  {
    label: "Create Highlights",
    message: "/highlights",
    description: "Create a brief, quotable version of the reflection.",
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
