"use client";

import { useState, useEffect, useCallback } from "react";
import * as workerTimers from "worker-timers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useChatStoreOld } from "../store/chatStoreOld";
import { useOllamaStore } from "../store";

export function CheckIn() {
  const { checkInInterval } = useOllamaStore();
  const [timeLeft, setTimeLeft] = useState(checkInInterval);
  const { addChat, setCurrentChat } = useChatStoreOld();
  const { isCheckInOpen, setIsCheckInOpen, setShowTasks } = useOllamaStore();

  const showCheckInDialog = useCallback(() => {
    setIsCheckInOpen(true);
  }, [setIsCheckInOpen]);

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

  const handleNotSoGreat = () => {
    const newChatId = addChat("general");
    setCurrentChat(newChatId);
    setShowTasks(false);
    handleDialogChange(false);
  };

  return (
    <>
      <Dialog open={isCheckInOpen} onOpenChange={handleDialogChange}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>How's it going?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handleGood}>Good (close dialog)</Button>
            <Button onClick={handleNotSoGreat}>
              I want to talk about it(start a new chat)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
