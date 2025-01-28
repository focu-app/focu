import { useOllamaStore } from "../store";

const isAnyDialogOpenInDOM = () => {
  return document.querySelector('[data-state="open"][role="dialog"]') !== null;
};

export const useDialogs = () => {
  const { closeMainWindow, closeOnEscape } = useOllamaStore();

  const closeTopMostDialog = () => {
    // First check if there are any dialogs open in the DOM
    console.log(isAnyDialogOpenInDOM(), closeOnEscape);
    if (!isAnyDialogOpenInDOM()) {
      if (closeOnEscape) {
        closeMainWindow();
      }
      return;
    }
  };

  return { closeTopMostDialog };
};
