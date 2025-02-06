import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

// Inspired by https://github.com/tauri-apps/tauri/issues/1656#issuecomment-1161495124
export const useTauriDraggable = () => {
  useEffect(() => {
    const noDragSelector =
      "input, a, button, [role='button'], [data-allow-context-menu='true'], p, h1, h2, h3, h4, h5, h6, span, div[contenteditable='true'], textarea, div[data-orientation='vertical'], div[data-orientation='horizontal']";

    let isDragging = false;

    const handleMouseDown = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(noDragSelector)) return;

      isDragging = true;
      getCurrentWindow().startDragging();
    };

    const handleSelectionChange = () => {
      if (isDragging) {
        window.getSelection()?.removeAllRanges();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
};
