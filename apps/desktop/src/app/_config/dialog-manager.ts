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
    isNewModelDialogOpen,
    setIsNewModelDialogOpen,
  } = useOllamaStore();

  const { isNewChatDialogOpen: isNewChat, setNewChatDialogOpen: setNewChat } =
    useChatStore();
  const { showTaskInput: isTaskInput, setShowTaskInput: setTaskInput } =
    useTaskStore();
  const { isTemplateDialogOpen, setIsTemplateDialogOpen } = useTemplateStore();
  const { isCheckInOpen: isCheckIn, setIsCheckInOpen: setCheckIn } =
    useCheckInStore();
  const { isLicenseDialogOpen: isLicense, closeLicenseDialog } =
    useLicenseStore();
  const { isEditTitleDialogOpen, setEditTitleDialogOpen } = useChatStore();

  const dialogs: DialogState[] = [
    { isOpen: isCommand, close: () => setCommand(false), priority: 1 },
    {
      isOpen: isSettings && !isTemplateDialogOpen && !isNewModelDialogOpen,
      close: () => setSettings(false),
      priority: 2,
    },
    { isOpen: isNewChat, close: () => setNewChat(false), priority: 2 },
    { isOpen: isTaskInput, close: () => setTaskInput(false), priority: 2 },
    { isOpen: isShortcuts, close: () => setShortcuts(false), priority: 2 },
    {
      isOpen: isTemplateDialogOpen,
      close: () => setIsTemplateDialogOpen(false),
      priority: 2,
    },
    { isOpen: isLicense, close: closeLicenseDialog, priority: 2 },
    { isOpen: isCheckIn, close: () => setCheckIn(false), priority: 2 },
    {
      isOpen: isNewModelDialogOpen,
      close: () => setIsNewModelDialogOpen(false),
      priority: 2,
    },
    {
      isOpen: isEditTitleDialogOpen,
      close: () => setEditTitleDialogOpen(false),
      priority: 2,
    },
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
