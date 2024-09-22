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

export function CheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const { addChat, setCurrentChat } = useChatStore();

  const showCheckInDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const intervalId = workerTimers.setInterval(
      showCheckInDialog,
      30 * 60 * 1000,
    ); // 30 minutes

    showCheckInDialog();

    return () => {
      workerTimers.clearInterval(intervalId);
    };
  }, [showCheckInDialog]);

  const handleGood = () => {
    setIsOpen(false);
  };

  const handleNotSoGreat = () => {
    const newChatId = addChat("general");
    setCurrentChat(newChatId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
  );
}
