"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as workerTimers from "worker-timers";
import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { useCheckInStore } from "../store/checkinStore";
import { Checkbox } from "@repo/ui/components/ui/checkbox";

const moodOptions = [
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "stressed", label: "Stressed", emoji: "😫" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "frustrated", label: "Frustrated", emoji: "😤" },
] as const;

export function CheckIn() {
  const { activeModel, showMainWindow } = useOllamaStore();
  const { addChat, sendChatMessage } = useChatStore();
  const {
    checkInInterval,
    checkInEnabled,
    isCheckInOpen,
    setIsCheckInOpen,
    checkInFocusWindow,
    addMoodEntry,
  } = useCheckInStore();
  const [timeLeft, setTimeLeft] = useState(checkInInterval);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const router = useRouter();

  const showCheckInDialog = useCallback(async () => {
    if (!checkInEnabled) {
      return;
    }
    const { appWindow, UserAttentionType } = await import(
      "@tauri-apps/api/window"
    );
    setIsCheckInOpen(true);

    const isVisible = await appWindow.isVisible();

    if (isVisible) {
      await appWindow.requestUserAttention(UserAttentionType.Critical);
    } else if (checkInFocusWindow) {
      showMainWindow();
    }
  }, [setIsCheckInOpen, checkInFocusWindow, showMainWindow, checkInEnabled]);

  const startTimer = useCallback(() => {
    setTimeLeft(checkInInterval);
    const intervalId = workerTimers.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {
          workerTimers.clearInterval(intervalId);
          showCheckInDialog();
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return intervalId;
  }, [showCheckInDialog, checkInInterval]);

  useEffect(() => {
    let timerId: number | undefined;
    if (!isCheckInOpen) {
      timerId = startTimer();
    }
    return () => {
      if (timerId) {
        workerTimers.clearInterval(timerId);
      }
    };
  }, [isCheckInOpen, startTimer]);

  const handleDialogChange = (open: boolean) => {
    setIsCheckInOpen(open);
  };

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods((current) =>
      current.includes(mood)
        ? current.filter((m) => m !== mood)
        : [...current, mood],
    );
  };

  const handleGood = async () => {
    await addMoodEntry(selectedMoods);
    handleDialogChange(false);
  };

  const handleNotSoGreat = async () => {
    if (!activeModel) {
      return;
    }
    await addMoodEntry(selectedMoods);

    const newChatId = await addChat({
      model: activeModel,
      date: new Date().setHours(0, 0, 0, 0),
      type: "general",
    });

    router.push(`/chat?id=${newChatId}`);
    handleDialogChange(false);

    if (selectedMoods.length > 0) {
      const message = `I'm feeling ${selectedMoods
        .map((mood) =>
          moodOptions.find((m) => m.id === mood)?.label.toLowerCase(),
        )
        .join(" and ")}. Can we talk about it?`;
      await sendChatMessage(newChatId, message);
    }
  };

  return (
    <Dialog open={isCheckInOpen} onOpenChange={handleDialogChange}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Periodic Check In</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Use this moment as an opportunity to be mindful and reflect on your
          day. How are you feeling right now?
        </DialogDescription>

        <div className="grid grid-cols-2 gap-4 py-4">
          {moodOptions.map((mood) => (
            <div key={mood.id} className="flex items-center space-x-2">
              <Checkbox
                id={mood.id}
                checked={selectedMoods.includes(mood.id)}
                onCheckedChange={() => handleMoodToggle(mood.id)}
              />
              <label
                htmlFor={mood.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <div className="flex flex-row w-full justify-between">
            <Button onClick={handleGood} variant="outline">
              Good (close)
            </Button>
            <Button onClick={handleNotSoGreat}>
              I want to talk about it (start a new chat)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
