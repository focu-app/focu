import { useEffect } from 'react';

type EventHandler = (event: Event) => void;

/**
 * A custom hook to add an event listener to a specified target.
 *
 * @param eventName - The name of the event to listen for.
 * @param handler - The function to handle the event.
 * @param element - The target element to attach the event listener to. Optional.
 */
export function useEventListener(
  eventName: string,
  handler: EventHandler,
  element?: HTMLElement | Window
) {
  useEffect(() => {
    const targetElement: HTMLElement | Window | null =
      element || (typeof window !== 'undefined' ? window : null);

    if (!targetElement || !targetElement.addEventListener) {
      return;
    }

    // Add event listener
    targetElement.addEventListener(eventName, handler);

    // Clean up the event listener on unmount or when dependencies change
    return () => {
      targetElement.removeEventListener(eventName, handler);
    };
  }, [eventName, handler, element]);
}