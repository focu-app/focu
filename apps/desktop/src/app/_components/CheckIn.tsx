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
import { emotionCategories } from "@/database/db";

export function CheckIn() {
  const { activeModel, showMainWindow } = useOllamaStore();
  const { addChat, sendChatMessage } = useChatStore();
  const {
    checkInInterval,
    checkInEnabled,
    isCheckInOpen,
    setIsCheckInOpen,
    checkInFocusWindow,
    addCheckIn,
  } = useCheckInStore();
  const [timeLeft, setTimeLeft] = useState(checkInInterval);
  const [selectedEmotions, setSelectedEmotions] = useState<{
    [categoryId: string]: string[];
  }>({});
  const [quickNote, setQuickNote] = useState<string>("");

  const handleEmotionToggle = (categoryId: string, optionId: string) => {
    setSelectedEmotions((current) => {
      const categorySelections = current[categoryId] || [];
      const updated = categorySelections.includes(optionId)
        ? categorySelections.filter((id) => id !== optionId)
        : [...categorySelections, optionId];

      return {
        ...current,
        [categoryId]: updated,
      };
    });
  };

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

  const handleGood = async () => {
    await addCheckIn({
      emotions: Object.entries(selectedEmotions).map(
        ([categoryId, selectedOptions]) => ({
          categoryId,
          selectedOptions,
        }),
      ),
      note: quickNote,
    });
    setQuickNote("");
    setSelectedEmotions({});
    handleDialogChange(false);
  };
  const handleNotSoGreat = async () => {
    if (!activeModel) {
      return;
    }

    // Save the check-in data
    await addCheckIn({
      emotions: Object.entries(selectedEmotions).map(
        ([categoryId, selectedOptions]) => ({
          categoryId,
          selectedOptions,
        }),
      ),
      note: quickNote,
    });
    setQuickNote("");
    setSelectedEmotions({});

    // Create a new chat
    const newChatId = await addChat({
      model: activeModel,
      date: new Date().setHours(0, 0, 0, 0),
      type: "general",
    });

    // Construct a detailed message
    const constructMessage = () => {
      const emotionalContext = Object.entries(selectedEmotions)
        .map(([categoryId, options]) => {
          if (options.length === 0) return null;

          const category = emotionCategories.find((c) => c.id === categoryId);
          const emotions = options
            .map((optionId) => {
              const emotion = category?.options.find((o) => o.id === optionId);
              return emotion?.label.toLowerCase();
            })
            .filter(Boolean)
            .join(", ");

          return `**${category?.label}:** ${emotions}`;
        })
        .filter(Boolean)
        .join("\n");

      const noteContext = quickNote
        ? `\n\nAdditional context: ${quickNote}`
        : "";

      return `Hi, I'd like to talk about how I'm feeling right now.

${emotionalContext}${noteContext}

Could you help me process these feelings? I'd appreciate:
1. Understanding why I might be feeling this way
2. Some practical strategies to manage these emotions
3. How these feelings might be affecting my work and what I can do about it`;
    };

    // Navigate and send message
    router.push(`/chat?id=${newChatId}`);
    handleDialogChange(false);

    const hasEmotions = Object.values(selectedEmotions).some(
      (arr) => arr.length > 0,
    );
    if (hasEmotions) {
      await sendChatMessage(newChatId, constructMessage());
    }
  };

  return (
    <Dialog open={isCheckInOpen} onOpenChange={handleDialogChange}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>How are you doing?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Take a moment to check in with yourself. Select all that apply:
        </DialogDescription>

        <div className="space-y-6">
          {emotionCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                {category.emoji} {category.label}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category.id}-${option.id}`}
                      checked={selectedEmotions[category.id]?.includes(
                        option.id,
                      )}
                      onCheckedChange={() =>
                        handleEmotionToggle(category.id, option.id)
                      }
                    />
                    <label
                      htmlFor={`${category.id}-${option.id}`}
                      className="text-sm font-medium leading-none flex items-center gap-2"
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Optional: Quick note input */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick note (optional):</p>
            <textarea
              className="w-full h-20 p-2 border rounded-md"
              placeholder="Anything specific you'd like to note?"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-row w-full justify-between">
            <Button onClick={handleGood} variant="outline">
              Save & Close
            </Button>
            <Button onClick={handleNotSoGreat}>
              I'd like to talk about it
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
