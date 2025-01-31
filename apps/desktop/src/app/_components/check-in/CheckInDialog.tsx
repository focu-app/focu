"use client";

import { emotionCategories } from "@/database/db";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as workerTimers from "worker-timers";
import { useChatStore } from "../../../store/chatStore";
import { useCheckInStore } from "../../../store/checkinStore";
import { useOllamaStore } from "../../../store/ollamaStore";

export function CheckInDialog() {
  const { activeModel, isOllamaRunning, showMainWindow } = useOllamaStore();
  const { addChat, sendChatMessage, setSelectedDate } = useChatStore();
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
    const { UserAttentionType } = await import("@tauri-apps/api/window");
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const appWindow = await WebviewWindow.getByLabel("main");
    setIsCheckInOpen(true);

    if (!appWindow) {
      return;
    }

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
    if (Object.values(selectedEmotions).some((arr) => arr.length > 0)) {
      await addCheckIn({
        emotions: Object.entries(selectedEmotions).map(
          ([categoryId, selectedOptions]) => ({
            categoryId,
            selectedOptions,
          }),
        ),
        note: quickNote,
      });
    }
    setQuickNote("");
    setSelectedEmotions({});
    handleDialogChange(false);
  };

  const handleNotSoGreat = async () => {
    if (!activeModel) {
      return;
    }
    const emotions = Object.entries(selectedEmotions).map(
      ([categoryId, selectedOptions]) => ({
        categoryId,
        selectedOptions,
      }),
    );

    if (emotions.length === 0) {
      return;
    }

    const dateString = format(new Date(), "yyyy-MM-dd");

    const newChatId = await addChat({
      model: activeModel,
      dateString,
      type: "general",
    });

    await addCheckIn({
      emotions,
      note: quickNote,
      chatId: newChatId,
    });
    setQuickNote("");
    setSelectedEmotions({});

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

          return `**${category?.label}:** ${emotions}\n`;
        })
        .filter(Boolean)
        .join("\n");

      const noteContext = quickNote
        ? `\n\n**Additional context:**\n${quickNote}\n\n`
        : "";

      return `Hi, I'd like to talk about how I'm feeling right now.

${emotionalContext}${noteContext}

Could you help me process these feelings?`;
    };

    setSelectedDate(dateString);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How are you doing?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Take a moment to check in with yourself. Select all that apply:
        </DialogDescription>

        <div className="space-y-8">
          {emotionCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                {category.emoji} {category.label}
              </h3>
              <div className="grid grid-rows-[repeat(3,_auto)] grid-flow-col gap-2">
                {category.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 w-[200px]"
                  >
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Quick note (optional):</p>
            <Textarea
              className="w-full h-20 p-2"
              placeholder="Anything specific you'd like to add?"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Next check-in in {Math.floor(checkInInterval / 1000 / 60)} minutes.
        </p>
        <DialogFooter>
          <div className="flex flex-row w-full justify-between">
            <Button onClick={handleGood} variant="outline">
              Save & Close
            </Button>
            <Button
              onClick={handleNotSoGreat}
              disabled={!activeModel || !isOllamaRunning}
            >
              I'd like to talk about it
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
