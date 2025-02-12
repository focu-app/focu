import { useAppStore } from "@/store/appStore";
import { useSettingsStore } from "@/store/settingsStore";

const isAnyDialogOpenInDOM = () => {
  return document.querySelector('[role="dialog"]') !== null;
};

const isAnyInputFocused = () => {
  return (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  );
};

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
