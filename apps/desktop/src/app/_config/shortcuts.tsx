import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { useTaskStore } from "../store/taskStore";
import { useTemplateStore } from "../store/templateStore";
import { useHotkeys } from "react-hotkeys-hook";
import { usePathname } from "next/navigation";
import { useDialogs } from "./dialog-manager";

export interface ShortcutConfig {
  key: string;
  description: string;
  scope?: "global" | "chat" | "focus";
}

function useShortcut(key: string, action: () => void) {
  useHotkeys(
    key,
    (e) => {
      e.preventDefault();
      action();
    },
    { enableOnFormTags: true },
    [action],
  );
}

export const useShortcuts = () => {
  const shortcuts: ShortcutConfig[] = [
    { key: "mod+k", description: "Open command menu", scope: "global" },
    { key: "mod+comma", description: "Open settings", scope: "global" },
    { key: "mod+b", description: "Toggle sidebar", scope: "global" },
    { key: "mod+/", description: "Show shortcuts", scope: "global" },
    { key: "escape", description: "Close current dialog", scope: "global" },
    { key: "mod+t", description: "Open template dialog", scope: "global" },
    { key: "mod+n", description: "New chat", scope: "chat" },
    { key: "mod+n", description: "New task", scope: "focus" },
  ];

  return shortcuts;
};

export const Shortcuts = () => {
  const { setIsSettingsOpen, setIsShortcutDialogOpen, setIsCommandMenuOpen } =
    useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar } = useChatStore();
  const { setShowTaskInput } = useTaskStore();
  const { setIsTemplateDialogOpen } = useTemplateStore();
  const { closeTopMostDialog } = useDialogs();
  const pathname = usePathname();

  // Global shortcuts
  useShortcut("mod+k", () => setIsCommandMenuOpen(true));
  useShortcut("mod+comma", () => setIsSettingsOpen(true));
  useShortcut("mod+b", () => toggleSidebar());
  useShortcut("mod+/", () => setIsShortcutDialogOpen(true));
  useShortcut("escape", closeTopMostDialog);
  useShortcut("mod+t", () => setIsTemplateDialogOpen(true));

  // Chat-specific shortcuts
  if (pathname.startsWith("/chat")) {
    useShortcut("mod+n", () => setNewChatDialogOpen(true));
  }

  // Focus-specific shortcuts
  if (pathname.startsWith("/focus")) {
    useShortcut("mod+n", () => setShowTaskInput(true));
  }

  return null;
};
