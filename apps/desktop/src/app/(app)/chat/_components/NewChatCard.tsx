"use client";

import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { getChatsForDay } from "@/database/chats";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { Moon, Sun } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";

type ChatType = "general" | "morning" | "evening";

export function NewChatCard({ type }: { type: ChatType }) {
  const { addChat, sendChatMessage, selectedDate } = useChatStore();
  const { activeModel } = useOllamaStore();
  const router = useRouter();

  const chats = useLiveQuery(async () => {
    return getChatsForDay(new Date(selectedDate || ""));
  }, [selectedDate]);

  const existingChat = chats?.find((chat) => chat.type === type);

  const handleOnClick = async (type: ChatType) => {
    if (!activeModel || !selectedDate) {
      return;
    }

    if (existingChat) {
      router.push(`/chat?id=${existingChat.id}`);
      return;
    }

    const newChatId = await addChat({
      model: activeModel,
      date: new Date(selectedDate).setHours(0, 0, 0, 0),
      type,
    });

    router.push(`/chat?id=${newChatId}`);

    await sendChatMessage(newChatId, "Please start the session.");
  };

  return (
    <Card className="w-[300px] lg:w-[340px] max-w-full bg-background/40 dark:bg-background/70">
      <CardHeader>
        <CardTitle className="">
          {type === "morning" ? "Morning Intention" : "Evening Reflection"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-sm text-accent-foreground">
            {type === "morning"
              ? "Start your day with a focus on gratitude and intention."
              : "Reflect on the events of the day and how to improve for tomorrow."}
          </p>
          <div>
            <Button
              variant="default"
              className="justify-start"
              onClick={() => handleOnClick(type)}
            >
              {type === "morning" ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {existingChat ? "Continue writing" : "Write now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
