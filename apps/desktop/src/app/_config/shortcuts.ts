import { useChatStore } from "../store/chatStore";
import { useOllamaStore } from "../store";
import { useTaskStore } from "../store/taskStore";

export type ShortcutAction = () => void;

export interface ShortcutConfig {
  key: string;
  description: string;
  action: ShortcutAction;
  context?: string;
}

export const useShortcuts = () => {
  const {
    setIsSettingsOpen,
    setIsShortcutDialogOpen,
    setIsCommandMenuOpen,
    isCommandMenuOpen,
    isSettingsOpen,
    isShortcutDialogOpen,
    closeMainWindow,
  } = useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar, isNewChatDialogOpen } = useChatStore();
  const { setShowTaskInput, showTaskInput } = useTaskStore();

  const closeAllDialogs = () => {
    if (isCommandMenuOpen) {
      setIsCommandMenuOpen(false);
    } else if (isSettingsOpen) {
      setIsSettingsOpen(false);
    } else if (isNewChatDialogOpen) {
      setNewChatDialogOpen(false);
    } else if (showTaskInput) {
      setShowTaskInput(false);
    } else if (isShortcutDialogOpen) {
      setIsShortcutDialogOpen(false);
    } else {
      closeMainWindow();
    }
  };

  const globalShortcuts: ShortcutConfig[] = [
    { key: "cmd+k", description: "Open command menu", action: () => setIsCommandMenuOpen(true) },
    { key: "cmd+,", description: "Open settings", action: () => setIsSettingsOpen(true) },
    { key: "cmd+b", description: "Toggle sidebar", action: () => toggleSidebar() },
    { key: "cmd+/", description: "Show shortcuts", action: () => setIsShortcutDialogOpen(true) },
    { key: "escape", description: "Close current dialog", action: closeAllDialogs },
  ];

  const chatShortcuts: ShortcutConfig[] = [
    { key: "cmd+n", description: "New chat", action: () => setNewChatDialogOpen(true), context: "chat" },
  ];

  const focusShortcuts: ShortcutConfig[] = [
    { key: "cmd+n", description: "New task", action: () => setShowTaskInput(true), context: "focus" },
  ];

  return [...globalShortcuts, ...chatShortcuts, ...focusShortcuts];
};