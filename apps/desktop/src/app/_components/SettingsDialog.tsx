"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
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
      <DialogContent
        className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] p-0 overflow-hidden flex flex-col"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex-grow overflow-hidden flex flex-col py-16 max-w-7xl w-full mx-auto">
          <Settings />
        </div>
      </DialogContent>
    </Dialog>
  );
}
