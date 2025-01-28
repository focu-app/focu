import { useOllamaStore } from "../store";

const isAnyDialogOpenInDOM = () => {
  return document.querySelector('[role="dialog"]') !== null;
};

const isAnyInputFocused = () => {
  return (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  );
};

export const useDialogs = () => {
  const { closeMainWindow, closeOnEscape } = useOllamaStore();

  const closeTopMostDialog = () => {
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

  return { closeTopMostDialog };
};
