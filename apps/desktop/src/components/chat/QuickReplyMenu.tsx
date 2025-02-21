import { getChat } from "@/database/chats";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { useChatStore } from "@/store/chatStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronDown, Zap } from "lucide-react";
import { useState } from "react";

export const QUICK_REPLY_MENU_OPTIONS = [
  {
    label: "Suggest Ideas or Actions",
    message: "Can you suggest a short list of ideas or actions I can take?",
    description:
      "Get actionable ideas or suggestions that you can apply to your current concerns or goals.",
  },
  {
    label: "Provide a Positive Quote",
    message:
      "Please provide a positive and motivating quote related to our discussion.",
    description: "Receive an uplifting quote to inspire and boost your mood.",
  },
  {
    label: "Give Alternative Perspective",
    message: "Please present an alternative perspective or viewpoint.",
    description:
      "Explore a different angle or viewpoint to broaden your understanding of your situation.",
  },
  {
    label: "Suggest Positive Reframe",
    message:
      "Please offer a positive reframe of my current situation or thoughts.",
    description:
      "Shift your perspective to a more positive and hopeful outlook on your current thoughts or situation.",
  },
  {
    label: "Challenge Thinking",
    message:
      "I would like to challenge my current thinking. Can you provide insights or questions that encourage me to consider different viewpoints?",
    description:
      "Question and examine your current thoughts to foster deeper understanding and growth.",
  },
  {
    label: "Encourage Goal-Setting and Action Steps",
    message:
      "Can you assist me in setting specific, achievable goals related to the current topic, and suggest steps to accomplish them?",
    description:
      "Get help in defining clear, attainable goals and planning the steps to achieve them.",
  },
];

interface QuickReplyMenuProps {
  chatId: number;
}

export function QuickReplyMenu({ chatId }: QuickReplyMenuProps) {
  const { sendChatMessage, replyLoading } = useChatStore();
  const { isModelAvailable } = useAIProviderStore();
  const [isOpen, setIsOpen] = useState(false);

  const chat = useLiveQuery(async () => {
    return getChat(chatId);
  }, [chatId]);

  const modelIsAvailable = chat?.model ? isModelAvailable(chat.model) : true;

  const handleQuickAction = (message: string) => {
    sendChatMessage(chatId, message);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(replyLoading || !modelIsAvailable)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Replies <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {QUICK_REPLY_MENU_OPTIONS.map((option, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleQuickAction(option.message)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
