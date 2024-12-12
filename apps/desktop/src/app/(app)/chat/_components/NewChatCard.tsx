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
import { Moon, Sparkles, Sun } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import type { ChatType } from "@/database/db";
import { cn } from "@repo/ui/lib/utils";
import { db } from "@/database/db";
import Link from "next/link";

export function NewChatCard({ type }: { type: ChatType }) {
  const { addChat, sendChatMessage, selectedDate, setSelectedDate } =
    useChatStore();
  const { activeModel, isOllamaRunning } = useOllamaStore();
  const router = useRouter();

  const chats = useLiveQuery(async () => {
    if (type === "year-end") {
      return db.chats.where("type").equals("year-end").toArray();
    }
    return getChatsForDay(new Date(selectedDate || ""));
  }, [selectedDate, type]);

  const existingChat = chats?.find((chat) =>
    type === "year-end" ? true : chat.type === type,
  );
  console.log(existingChat);
  console.log(existingChat);

  const handleOnClick = async (type: ChatType) => {
    if (type === "year-end") {
      router.push("/reflection");
      return;
    }

    if (!activeModel || !selectedDate || !isOllamaRunning) {
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

  function getTitle() {
    switch (type) {
      case "morning":
        return "Morning Intention";
      case "evening":
        return "Evening Reflection";
      case "year-end":
        return "End of Year Reflection";
    }
  }

  function getDescription() {
    switch (type) {
      case "morning":
        return "Start your day with a focus on gratitude and intention.";
      case "evening":
        return "Reflect on the events of the day and how to improve for tomorrow.";
      case "year-end":
        return "Reflect on the past year and set your intentions for next year.";
    }
  }

  function getIcon() {
    if (type === "year-end") {
      return <Sparkles className="h-4 w-4 mr-2" />;
    }
    return type === "morning" ? (
      <Sun className="h-4 w-4 mr-2" />
    ) : (
      <Moon className="h-4 w-4 mr-2" />
    );
  }

  return (
    <Card
      className={cn(
        "w-[300px] lg:w-[340px] max-w-full bg-background/40 dark:bg-background/70",
        type === "year-end" &&
          "border-2 border-green-500/90 dark:border-green-400/90",
      )}
    >
      <CardHeader>
        <CardTitle className="">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-sm text-accent-foreground">{getDescription()}</p>
          <div>
            <Button
              variant="default"
              className="justify-start"
              disabled={type !== "year-end" && !isOllamaRunning}
              onClick={() => handleOnClick(type)}
            >
              {getIcon()}
              {type === "year-end"
                ? "Go to Reflection"
                : existingChat
                  ? "Continue writing"
                  : "Write now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
