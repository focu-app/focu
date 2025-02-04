"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Settings } from "./Settings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">Settings</DialogTitle>
      <DialogContent
        className="max-w-5xl w-[90vw] max-h-[90vh] h-[90vh] p-1 bg-background"
        aria-description="Settings"
      >
        <Settings />
      </DialogContent>
    </Dialog>
  );
}
