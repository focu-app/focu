import {
  isAnyInputFocused,
  isAnyDialogOpenInDOM,
} from "@/components/shortcuts/Shortcuts";
import { useAppStore } from "@/store/appStore";
import { useSettingsStore } from "@/store/settingsStore";

export function useEscapeHandler() {
  const { closeOnEscape } = useSettingsStore();
  const { closeMainWindow } = useAppStore();

  const handleEscape = () => {
    if (isAnyInputFocused()) {
      (document.activeElement as HTMLElement)?.blur();

      return;
    }

    if (!isAnyDialogOpenInDOM()) {
      if (closeOnEscape) {
        closeMainWindow();
      }
      return;
    }
  };

  return { handleEscape };
}
