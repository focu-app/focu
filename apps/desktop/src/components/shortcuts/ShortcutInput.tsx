import { Input } from "@repo/ui/components/ui/input";
import { type KeyboardEvent, useEffect, useState } from "react";

interface ShortcutInputProps {
  value: string;
  onChange: (shortcut: string) => void;
}

export function ShortcutInput({ value, onChange }: ShortcutInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentKeys, setCurrentKeys] = useState<string[]>([]);
  const [tempShortcut, setTempShortcut] = useState(value);

  useEffect(() => {
    setTempShortcut(value);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isCapturing) {
      const keys = new Set<string>();
      if (e.ctrlKey) keys.add("Control");
      if (e.metaKey) keys.add("Command");
      if (e.altKey) keys.add("Alt");
      if (e.shiftKey) keys.add("Shift");

      const key = e.key.toUpperCase();
      if (!["CONTROL", "META", "ALT", "SHIFT"].includes(key)) {
        keys.add(key);
      }

      setCurrentKeys(Array.from(keys));
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isCapturing && currentKeys.length > 0) {
      const shortcut = currentKeys.join("+");
      setTempShortcut(shortcut);
      setIsCapturing(false);
      setCurrentKeys([]);
      onChange(shortcut);
    }
  };

  const handleBlur = () => {
    setIsCapturing(false);
    setCurrentKeys([]);
    if (tempShortcut !== value) {
      onChange(tempShortcut);
    }
  };

  return (
    <Input
      type="text"
      value={
        isCapturing ? currentKeys.join("+") || "Press keys..." : tempShortcut
      }
      onFocus={() => {
        setIsCapturing(true);
        setTempShortcut(value);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      readOnly
    />
  );
}
