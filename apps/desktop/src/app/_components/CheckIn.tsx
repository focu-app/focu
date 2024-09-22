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

const CHECK_IN_INTERVAL = 1 * 60 * 1000; // 30 minutes

export function CheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHECK_IN_INTERVAL);
  const { addChat, setCurrentChat } = useChatStore();

  const showCheckInDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

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
    const timerId = startTimer();
    return () => workerTimers.clearInterval(timerId);
  }, [startTimer]);

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      startTimer();
    }
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
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
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
