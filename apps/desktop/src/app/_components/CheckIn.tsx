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

export function CheckIn() {
  const { checkInInterval, activeModel } = useOllamaStore();
  const [timeLeft, setTimeLeft] = useState(checkInInterval);
  const { addChat } = useChatStore();
  const {
    checkInEnabled,
    isCheckInOpen,
    setIsCheckInOpen,
    checkInFocusWindow,
  } = useOllamaStore();
  const router = useRouter();

  const showCheckInDialog = useCallback(async () => {
    if (!checkInEnabled) {
      return;
    }
    const { WebviewWindow, appWindow, UserAttentionType } = await import(
      "@tauri-apps/api/window"
    );
    const { invoke } = await import("@tauri-apps/api/tauri");
    setIsCheckInOpen(true);

    if (checkInFocusWindow) {
      await WebviewWindow.getByLabel("main")?.show();
      await WebviewWindow.getByLabel("main")?.setFocus();
      await invoke("set_dock_icon_visibility", { visible: true });
      await appWindow.requestUserAttention(UserAttentionType.Critical);
    }
  }, [setIsCheckInOpen, checkInFocusWindow, checkInEnabled]);

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

  const handleGood = () => {
    handleDialogChange(false);
  };

  const handleNotSoGreat = async () => {
    if (!activeModel) {
      return;
    }
    const newChatId = await addChat({
      model: activeModel,
      date: new Date().setHours(0, 0, 0, 0),
      type: "general",
    });
    router.push(`/chat?id=${newChatId}`);
    handleDialogChange(false);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={handleDialogChange}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Periodic Check In</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Use this moment as an oppertunity to be mindful and reflect on your
            day.
          </DialogDescription>
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
    </>
  );
}
