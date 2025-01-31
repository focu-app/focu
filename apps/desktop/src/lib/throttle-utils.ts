import type { ThrottleSpeed } from "../store/chatStore";

export const getThrottleConfig = (
  shouldThrottle: boolean,
  throttleSpeed: ThrottleSpeed,
) => {
  if (!shouldThrottle) return undefined;

  const getThrottleDelay = (speed: ThrottleSpeed): number => {
    switch (speed) {
      case "slow":
        return 40;
      case "medium":
        return 20;
      case "fast":
        return 10;
      default:
        return 10;
    }
  };

  return {
    delayInMs: getThrottleDelay(throttleSpeed),
    chunking: "word" as const,
  };
};
