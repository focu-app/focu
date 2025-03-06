export type ShortcutScope =
  | "chat"
  | "focus"
  | "global"
  | "check-in"
  | "journal";

export interface ShortcutConfig {
  key: string;
  description: string;
  scope: ShortcutScope;
}

export const shortcuts: ShortcutConfig[] = [
  { key: "CMD+k", description: "Open command menu", scope: "global" },
  { key: "CMD+,", description: "Open settings", scope: "global" },
  { key: "CMD+b", description: "Toggle sidebar", scope: "global" },
  { key: "CMD+/", description: "Show shortcuts", scope: "global" },
  { key: "escape", description: "Close current dialog", scope: "global" },
  { key: "CMD+n", description: "New chat", scope: "chat" },
  { key: "CMD+n", description: "New task", scope: "focus" },
  { key: "CMD+n", description: "New check-in", scope: "check-in" },
  { key: "CMD+n", description: "New journal entry", scope: "journal" },
  { key: "CMD+shift+R", description: "Regenerate reply", scope: "chat" },
  { key: "CMD+shift+C", description: "Copy last message", scope: "chat" },
  { key: "CMD+shift+S", description: "Stop reply", scope: "chat" },
];
