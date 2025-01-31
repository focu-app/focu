import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export function useWindowFocus(callback: () => void) {
  useEffect(() => {
    const unlisten = listen("tauri://focus", () => {
      callback();
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [callback]);
}
