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
  const { setIsSettingsOpen, closeMainWindow } = useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar } = useChatStore();
  const { setShowTaskInput } = useTaskStore();

  const globalShortcuts: ShortcutConfig[] = [
    { key: "cmd+k", description: "Open command menu", action: () => { } },
    { key: "cmd+,", description: "Open settings", action: () => setIsSettingsOpen(true) },
    { key: "cmd+b", description: "Toggle sidebar", action: () => toggleSidebar() },
    { key: "cmd+/", description: "Show shortcuts", action: () => { } },
    { key: "escape", description: "Close current dialog", action: () => { } },
  ];

  const chatShortcuts: ShortcutConfig[] = [
    { key: "cmd+n", description: "New chat", action: () => setNewChatDialogOpen(true), context: "chat" },
  ];

  const focusShortcuts: ShortcutConfig[] = [
    { key: "cmd+n", description: "New task", action: () => setShowTaskInput(true), context: "focus" },
  ];

  return [...globalShortcuts, ...chatShortcuts, ...focusShortcuts];
};