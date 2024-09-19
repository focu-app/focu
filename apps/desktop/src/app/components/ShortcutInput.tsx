import React, { useState, KeyboardEvent } from "react";
import { Input } from "@repo/ui/components/ui/input";

interface ShortcutInputProps {
  value: string;
  onChange: (shortcut: string) => void;
}

export function ShortcutInput({ value, onChange }: ShortcutInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isCapturing) {
      const keys = [];
      if (e.ctrlKey) keys.push("Control");
      if (e.metaKey) keys.push("Command");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");

      const key = e.key.toUpperCase();
      if (!["CONTROL", "META", "ALT", "SHIFT"].includes(key)) {
        keys.push(key);
      }

      const shortcut = keys.join("+");
      onChange(shortcut);
      setIsCapturing(false);
    }
  };

  return (
    <Input
      type="text"
      value={isCapturing ? "Press keys..." : value}
      onFocus={() => setIsCapturing(true)}
      onBlur={() => setIsCapturing(false)}
      onKeyDown={handleKeyDown}
      readOnly
    />
  );
}
