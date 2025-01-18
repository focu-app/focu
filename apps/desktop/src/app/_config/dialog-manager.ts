import { useOllamaStore } from "../store";
import { useChatStore } from "../store/chatStore";
import { useCheckInStore } from "../store/checkinStore";
import { useLicenseStore } from "../store/licenseStore";
import { useTaskStore } from "../store/taskStore";
import { useTemplateStore } from "../store/templateStore";

export type DialogState = {
  isOpen: boolean;
  close: () => void;
  priority: number;
};

export const useDialogs = () => {
  const {
    isSettingsOpen: isSettings,
    setIsSettingsOpen: setSettings,
    isShortcutDialogOpen: isShortcuts,
    setIsShortcutDialogOpen: setShortcuts,
    isCommandMenuOpen: isCommand,
    setIsCommandMenuOpen: setCommand,
    closeMainWindow,
    closeOnEscape,
  } = useOllamaStore();

  const { isNewChatDialogOpen: isNewChat, setNewChatDialogOpen: setNewChat } =
    useChatStore();
  const { showTaskInput: isTaskInput, setShowTaskInput: setTaskInput } =
    useTaskStore();
  const {
    isTemplateDialogOpen: isTemplate,
    setIsTemplateDialogOpen: setTemplate,
  } = useTemplateStore();
  const { isCheckInOpen: isCheckIn, setIsCheckInOpen: setCheckIn } =
    useCheckInStore();
  const { isLicenseDialogOpen: isLicense, closeLicenseDialog } =
    useLicenseStore();

  const dialogs: DialogState[] = [
    { isOpen: isCommand, close: () => setCommand(false), priority: 1 },
    {
      isOpen: isSettings && !isTemplate,
      close: () => setSettings(false),
      priority: 2,
    },
    { isOpen: isNewChat, close: () => setNewChat(false), priority: 2 },
    { isOpen: isTaskInput, close: () => setTaskInput(false), priority: 2 },
    { isOpen: isShortcuts, close: () => setShortcuts(false), priority: 2 },
    { isOpen: isTemplate, close: () => setTemplate(false), priority: 2 },
    { isOpen: isLicense, close: closeLicenseDialog, priority: 2 },
    { isOpen: isCheckIn, close: () => setCheckIn(false), priority: 2 },
    { isOpen: closeOnEscape, close: closeMainWindow, priority: 3 },
  ];

  const closeTopMostDialog = () => {
    const openDialogs = dialogs.filter((d) => d.isOpen);
    if (openDialogs.length === 0) return;

    const topPriority = Math.min(...openDialogs.map((d) => d.priority));
    const topDialog = openDialogs.find((d) => d.priority === topPriority);
    topDialog?.close();
  };

  return { closeTopMostDialog };
};
