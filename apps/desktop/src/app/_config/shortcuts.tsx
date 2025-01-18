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

export const shortcuts: ShortcutConfig[] = [
  { key: "mod+k", description: "Open command menu", scope: "global" },
  { key: "mod+comma", description: "Open settings", scope: "global" },
  { key: "mod+b", description: "Toggle sidebar", scope: "global" },
  { key: "mod+/", description: "Show shortcuts", scope: "global" },
  { key: "escape", description: "Close current dialog", scope: "global" },
  { key: "mod+t", description: "Open template dialog", scope: "global" },
  { key: "mod+n", description: "New chat", scope: "chat" },
  { key: "mod+n", description: "New task", scope: "focus" },
];

function useShortcut(shortcut: ShortcutConfig, action: () => void) {
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
      enabled: isInScope,
    },
    [action, isInScope],
  );
}

export const Shortcuts = () => {
  const { setIsSettingsOpen, setIsShortcutDialogOpen, setIsCommandMenuOpen } =
    useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar } = useChatStore();
  const { setShowTaskInput } = useTaskStore();
  const { setIsTemplateDialogOpen } = useTemplateStore();
  const { closeTopMostDialog } = useDialogs();

  // Register all shortcuts with their scopes
  useShortcut(shortcuts.find((s) => s.key === "mod+k")!, () =>
    setIsCommandMenuOpen(true),
  );
  useShortcut(shortcuts.find((s) => s.key === "mod+comma")!, () =>
    setIsSettingsOpen(true),
  );
  useShortcut(shortcuts.find((s) => s.key === "mod+b")!, () => toggleSidebar());
  useShortcut(shortcuts.find((s) => s.key === "mod+/")!, () =>
    setIsShortcutDialogOpen(true),
  );
  useShortcut(shortcuts.find((s) => s.key === "escape")!, closeTopMostDialog);
  useShortcut(shortcuts.find((s) => s.key === "mod+t")!, () =>
    setIsTemplateDialogOpen(true),
  );
  useShortcut(
    shortcuts.find((s) => s.key === "mod+n" && s.scope === "chat")!,
    () => setNewChatDialogOpen(true),
  );
  useShortcut(
    shortcuts.find((s) => s.key === "mod+n" && s.scope === "focus")!,
    () => setShowTaskInput(true),
  );

  return null;
};
