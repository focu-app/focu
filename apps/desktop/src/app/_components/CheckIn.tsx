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
import { useChatStore } from "../store/chatStore";
import { useOllamaStoreShallow } from "../store";

const CHECK_IN_INTERVAL = 0.1 * 60 * 1000; // 6 seconds for testing

export function CheckIn() {
  const [timeLeft, setTimeLeft] = useState(CHECK_IN_INTERVAL);
  const { addChat, setCurrentChat } = useChatStore();
  const { isCheckInOpen, setIsCheckInOpen } = useOllamaStoreShallow();

  const showCheckInDialog = useCallback(() => {
    setIsCheckInOpen(true);
  }, [setIsCheckInOpen]);

  const startTimer = useCallback(() => {
    setTimeLeft(CHECK_IN_INTERVAL);
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
  }, [showCheckInDialog]);

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
            <Button onClick={handleGood}>Good (close)</Button>
            <Button onClick={handleNotSoGreat}>Not so great (new chat)</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md text-sm">
        Debug: Next check-in in {Math.floor(timeLeft / 1000)} seconds
      </div>
    </>
  );
}
