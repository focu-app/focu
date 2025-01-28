import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Kbd } from "@repo/ui/components/ui/kbd";
import type React from "react";
import { type ShortcutConfig, shortcuts } from "../_config/shortcuts";

interface ShortcutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShortcutDialog: React.FC<ShortcutDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const renderShortcut = (shortcut: ShortcutConfig) => (
    <div key={shortcut.key} className="flex justify-between py-2">
      <span>{shortcut.description}</span>
      <Kbd>{shortcut.key}</Kbd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Global Shortcuts</h3>
          {shortcuts.filter((s) => s.scope === "global").map(renderShortcut)}

          <h3 className="text-lg font-semibold mt-4 mb-2">Chat Shortcuts</h3>
          {shortcuts.filter((s) => s.scope === "chat").map(renderShortcut)}

          <h3 className="text-lg font-semibold mt-4 mb-2">Focus Shortcuts</h3>
          {shortcuts.filter((s) => s.scope === "focus").map(renderShortcut)}

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Check-in Shortcuts
          </h3>
          {shortcuts.filter((s) => s.scope === "check-in").map(renderShortcut)}
        </div>
      </DialogContent>
    </Dialog>
  );
};
