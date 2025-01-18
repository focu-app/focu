import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { useTaskStore } from "../store/taskStore";
import { useTemplateStore } from "../store/templateStore";
import { useHotkeys } from "react-hotkeys-hook";
import { usePathname } from "next/navigation";
import { useDialogs } from "./dialog-manager";

export type ShortcutScope = "chat" | "focus" | "global";

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
type ScopedShortcut = { chat?: () => void; focus?: () => void };
type ShortcutAction = GlobalShortcut | ScopedShortcut;

function isGlobalShortcut(action: ShortcutAction): action is GlobalShortcut {
  return typeof action === "function";
}

function isScopedShortcut(action: ShortcutAction): action is ScopedShortcut {
  return typeof action === "object" && ("chat" in action || "focus" in action);
}

export const Shortcuts = () => {
  const { setIsSettingsOpen, setIsShortcutDialogOpen, setIsCommandMenuOpen } =
    useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar } = useChatStore();
  const { setShowTaskInput } = useTaskStore();
  const { setIsTemplateDialogOpen } = useTemplateStore();
  const { closeTopMostDialog } = useDialogs();

  const shortcutActions: Record<string, ShortcutAction> = {
    "mod+k": () => setIsCommandMenuOpen(true),
    "mod+comma": () => setIsSettingsOpen(true),
    "mod+b": () => toggleSidebar(),
    "mod+/": () => setIsShortcutDialogOpen(true),
    escape: closeTopMostDialog,
    "mod+t": () => setIsTemplateDialogOpen(true),
    "mod+n": {
      chat: () => setNewChatDialogOpen(true),
      focus: () => setShowTaskInput(true),
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
  { key: "CMD+t", description: "Open template dialog", scope: "global" },
  { key: "CMD+n", description: "New chat", scope: "chat" },
  { key: "CMD+n", description: "New task", scope: "focus" },
];
