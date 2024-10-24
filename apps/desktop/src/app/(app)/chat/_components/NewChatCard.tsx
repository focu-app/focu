"use client";

import { useOllamaStore } from "@/app/store";
import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { MessageCircle, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

type ChatType = "general" | "morning" | "evening";

export function NewChatCard({ type }: { type: ChatType }) {
  const { addChat, selectedDate } = useChatStore();
  const { activeModel } = useOllamaStore();
  const router = useRouter();

  const handleCreateChat = async (type: ChatType) => {
    if (!activeModel || !selectedDate) {
      return;
    }
    const newChatId = await addChat({
      model: activeModel,
      date: new Date(selectedDate).setHours(0, 0, 0, 0),
      type,
    });

    router.push(`/chat?id=${newChatId}`);
  };

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>
          {type === "morning" ? "Morning Intention" : "Evening Reflection"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            {type === "morning"
              ? "Start your day with a focus on gratitude and intention."
              : "Reflect on the events of the day and how to improve for tomorrow."}
          </p>
          <div>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleCreateChat(type)}
            >
              {type === "morning" ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              Write now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
