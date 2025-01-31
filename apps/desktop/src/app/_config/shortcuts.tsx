import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { useOllamaStore } from "../store/ollamaStore";
import { useChatStore } from "../store/chatStore";
import { useCheckInStore } from "../store/checkinStore";
import { useTaskStore } from "../store/taskStore";
import { useDialogs } from "./dialog-manager";

export type ShortcutScope = "chat" | "focus" | "global" | "check-in";

export interface ShortcutConfig {
  key: string;
  description: string;
  scope: ShortcutScope;
}

function useShortcut(
  shortcut: ShortcutConfig,
  action: () => void,
  enabled = true,
) {
  const pathname = usePathname();
  const isInScope =
    shortcut.scope === "global" || pathname.startsWith(`/${shortcut.scope}`);

  useHotkeys(
    shortcut.key,
    (e) => {
      e.preventDefault();
      action();
    },
    {
      enableOnFormTags: true,
      enabled: isInScope && enabled,
    },
    [action, isInScope, enabled],
  );
}

type GlobalShortcut = () => void;
type ScopedShortcut = {
  chat?: () => void;
  focus?: () => void;
  "check-in"?: () => void;
};
type ShortcutAction = GlobalShortcut | ScopedShortcut;

function isGlobalShortcut(action: ShortcutAction): action is GlobalShortcut {
  return typeof action === "function";
}

function isScopedShortcut(action: ShortcutAction): action is ScopedShortcut {
  return typeof action === "object" && ("chat" in action || "focus" in action);
}

export const Shortcuts = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
    isCommandMenuOpen,
    setIsCommandMenuOpen,
  } = useOllamaStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen, toggleSidebar } =
    useChatStore();
  const { showTaskInput, setShowTaskInput } = useTaskStore();
  const { isCheckInOpen, setIsCheckInOpen } = useCheckInStore();
  const { closeTopMostDialog } = useDialogs();

  const shortcutActions: Record<string, ShortcutAction> = {
    "mod+k": () => setIsCommandMenuOpen(!isCommandMenuOpen),
    "mod+comma": () => setIsSettingsOpen(!isSettingsOpen),
    "mod+b": () => toggleSidebar(),
    "mod+/": () => setIsShortcutDialogOpen(!isShortcutDialogOpen),
    escape: closeTopMostDialog,
    "mod+n": {
      chat: () => setNewChatDialogOpen(!isNewChatDialogOpen),
      focus: () => setShowTaskInput(!showTaskInput),
      "check-in": () => setIsCheckInOpen(!isCheckInOpen),
    },
  };

  // Register all shortcuts
  for (const [key, value] of Object.entries(shortcutActions)) {
    if (isGlobalShortcut(value)) {
      useShortcut({ key, description: "", scope: "global" }, value);
    } else if (isScopedShortcut(value)) {
      if (value.chat) {
        useShortcut({ key, description: "", scope: "chat" }, value.chat);
      }
      if (value.focus) {
        useShortcut({ key, description: "", scope: "focus" }, value.focus);
      }
      if (value["check-in"]) {
        useShortcut(
          { key, description: "", scope: "check-in" },
          value["check-in"],
        );
      }
    }
  }

  return null;
};

// Separate the shortcut definitions for the dialog
export const shortcuts: ShortcutConfig[] = [
  { key: "CMD+k", description: "Open command menu", scope: "global" },
  { key: "CMD+,", description: "Open settings", scope: "global" },
  { key: "CMD+b", description: "Toggle sidebar", scope: "global" },
  { key: "CMD+/", description: "Show shortcuts", scope: "global" },
  { key: "escape", description: "Close current dialog", scope: "global" },
  { key: "CMD+n", description: "New chat", scope: "chat" },
  { key: "CMD+n", description: "New task", scope: "focus" },
  { key: "CMD+n", description: "New check-in", scope: "check-in" },
  { key: "CMD+shift+R", description: "Regenerate reply", scope: "chat" },
  { key: "CMD+shift+C", description: "Copy last message", scope: "chat" },
  { key: "CMD+shift+S", description: "Stop reply", scope: "chat" },
];
