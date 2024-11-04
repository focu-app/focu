import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { useCheckInStore } from "../store/checkinStore";
import { useLicenseStore } from "../store/licenseStore";
import { useTaskStore } from "../store/taskStore";
import { useTemplateStore } from "../store/templateStore";

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
    closeOnEscape,
  } = useOllamaStore();
  const { setNewChatDialogOpen, toggleSidebar, isNewChatDialogOpen } =
    useChatStore();
  const { setShowTaskInput, showTaskInput } = useTaskStore();
  const { setIsTemplateDialogOpen, isTemplateDialogOpen } = useTemplateStore();
  const { isCheckInOpen, setIsCheckInOpen } = useCheckInStore();
  const {
    isLicenseDialogOpen,
    closeLicenseDialog,
    isTrialExpired,
    instanceId,
  } = useLicenseStore();

  const closeAllDialogs = () => {
    if (isCommandMenuOpen) {
      setIsCommandMenuOpen(false);
    } else if (isSettingsOpen && !isTemplateDialogOpen) {
      setIsSettingsOpen(false);
    } else if (isNewChatDialogOpen) {
      setNewChatDialogOpen(false);
    } else if (showTaskInput) {
      setShowTaskInput(false);
    } else if (isShortcutDialogOpen) {
      setIsShortcutDialogOpen(false);
    } else if (isTemplateDialogOpen) {
      setIsTemplateDialogOpen(false);
    } else if (isLicenseDialogOpen) {
      closeLicenseDialog();
    } else if (isCheckInOpen) {
      setIsCheckInOpen(false);
    } else if (closeOnEscape) {
      closeMainWindow();
    }
  };

  const globalShortcuts: ShortcutConfig[] = [
    {
      key: "cmd+k",
      description: "Open command menu",
      action: () => setIsCommandMenuOpen(true),
    },
    {
      key: "cmd+,",
      description: "Open settings",
      action: () => setIsSettingsOpen(true),
    },
    {
      key: "cmd+b",
      description: "Toggle sidebar",
      action: () => toggleSidebar(),
    },
    {
      key: "cmd+/",
      description: "Show shortcuts",
      action: () => setIsShortcutDialogOpen(true),
    },
    {
      key: "escape",
      description: "Close current dialog",
      action: closeAllDialogs,
    },
    {
      key: "cmd+t",
      description: "Open template dialog",
      action: () => setIsTemplateDialogOpen(true),
    },
  ];

  const chatShortcuts: ShortcutConfig[] = [
    {
      key: "cmd+n",
      description: "New chat",
      action: () => setNewChatDialogOpen(true),
      context: "chat",
    },
  ];

  const focusShortcuts: ShortcutConfig[] = [
    {
      key: "cmd+n",
      description: "New task",
      action: () => setShowTaskInput(true),
      context: "focus",
    },
  ];

  return [...globalShortcuts, ...chatShortcuts, ...focusShortcuts];
};
