"use client";

import { getChatsForDay } from "@/database/chats";
import type { ChatType } from "@/database/db";
import { db } from "@/database/db";
import { useChatStore } from "@/store/chatStore";
import { useAIProviderStore } from "@/store/aiProviderStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { Moon, Sparkles, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewChatCard({ type }: { type: ChatType }) {
  const {
    addChat,
    sendChatMessage,
    selectedDate,
    setSelectedDate,
    startSession,
  } = useChatStore();
  const { activeModel, isModelAvailable } = useAIProviderStore();
  const router = useRouter();

  const chats = useLiveQuery(async () => {
    if (type === "year-end") {
      return db.chats.where("type").equals("year-end").toArray();
    }
    const defaultDate = format(new Date(), "yyyy-MM-dd");
    const dateToUse = selectedDate || defaultDate;
    return getChatsForDay(dateToUse);
  }, [selectedDate, type]);

  const existingChat = chats?.find((chat) =>
    type === "year-end" ? true : chat.type === type,
  );

  const handleOnClick = async (type: ChatType) => {
    if (type === "year-end") {
      router.push("/reflection");
      return;
    }

    if (!activeModel || !selectedDate) {
      return;
    }

    if (existingChat) {
      router.push(`/chat?id=${existingChat.id}`);
      return;
    }

    const newChatId = await addChat({
      model: activeModel,
      dateString: selectedDate,
      type,
    });

    router.push(`/chat?id=${newChatId}`);

    await startSession(newChatId);
  };

  const isModelEnabled = activeModel ? isModelAvailable(activeModel) : false;

  return (
    <Card
      className={cn(
        "w-[300px] lg:w-[340px] max-w-full bg-background/40 dark:bg-background/70",
        type === "year-end" &&
          "border-2 border-green-500/90 dark:border-green-400/90",
      )}
    >
      <CardHeader>
        <CardTitle className="">
          {type === "morning" && (
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Morning Intention
            </div>
          )}
          {type === "evening" && (
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Evening Reflection
            </div>
          )}
          {type === "year-end" && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              End of Year Reflection
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-sm text-accent-foreground">
            {type === "morning" &&
              "Start your day with a focus on gratitude and intention."}
            {type === "evening" &&
              "Reflect on the events of the day and how to improve for tomorrow."}
            {type === "year-end" &&
              "Reflect on the past year and set your intentions for next year."}
          </p>
          <div>
            {existingChat ? (
              <Button
                variant="default"
                className="justify-start"
                onClick={() => handleOnClick(type)}
              >
                Continue Chat
              </Button>
            ) : (
              <Button
                variant="default"
                className="justify-start"
                disabled={type !== "year-end" && !isModelEnabled}
                onClick={() => handleOnClick(type)}
              >
                Start Chat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
