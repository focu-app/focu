import type { ShortcutConfig } from "@/lib/shortcuts";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { useEscapeHandler } from "../../hooks/useEscapeHandler";
import { useChatStore } from "../../store/chatStore";
import { useCheckInStore } from "../../store/checkinStore";
import { useOllamaStore } from "../../store/ollamaStore";
import { useTaskStore } from "../../store/taskStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useJournalStore } from "@/store/journalStore";

export const isAnyDialogOpenInDOM = () => {
  return document.querySelector('[role="dialog"]') !== null;
};

export const isAnyInputFocused = () => {
  return (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  );
};

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
  journal?: () => void;
};
type ShortcutAction = GlobalShortcut | ScopedShortcut;

function isGlobalShortcut(action: ShortcutAction): action is GlobalShortcut {
  return typeof action === "function";
}

function isScopedShortcut(action: ShortcutAction): action is ScopedShortcut {
  return (
    typeof action === "object" &&
    ("chat" in action ||
      "focus" in action ||
      "check-in" in action ||
      "journal" in action)
  );
}

export function Shortcuts() {
  const {
    isCommandMenuOpen,
    setIsCommandMenuOpen,
    isShortcutDialogOpen,
    setIsShortcutDialogOpen,
  } = useOllamaStore();
  const { isNewChatDialogOpen, setNewChatDialogOpen, toggleSidebar } =
    useChatStore();
  const { showTaskInput, setShowTaskInput } = useTaskStore();
  const { isCheckInOpen, setIsCheckInOpen } = useCheckInStore();
  const { handleEscape } = useEscapeHandler();
  const { isSettingsOpen, setIsSettingsOpen } = useSettingsStore();
  const router = useRouter();

  // Handle creating a new journal entry
  const handleNewJournalEntry = async () => {
    const newId = await useJournalStore.getState().createNewEntry();
    if (newId) {
      router.push(`/journal?id=${newId}`);
    }
  };

  const shortcutActions: Record<string, ShortcutAction> = {
    "mod+k": () => setIsCommandMenuOpen(!isCommandMenuOpen),
    "mod+comma": () => setIsSettingsOpen(!isSettingsOpen),
    "mod+b": () => toggleSidebar(),
    "mod+/": () => setIsShortcutDialogOpen(!isShortcutDialogOpen),
    "mod+n": {
      chat: () => setNewChatDialogOpen(!isNewChatDialogOpen),
      focus: () => setShowTaskInput(!showTaskInput),
      "check-in": () => setIsCheckInOpen(!isCheckInOpen),
      journal: () => handleNewJournalEntry(),
    },
    escape: () => handleEscape(),
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
      if (value.journal) {
        useShortcut({ key, description: "", scope: "journal" }, value.journal);
      }
    }
  }

  return null;
}
