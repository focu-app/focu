import { useOllamaStore } from "@/store/ollamaStore";
import { useEffect, useState } from "react";

export function useModelAvailability(model: string | undefined | null) {
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const { checkModelExists } = useOllamaStore();

  useEffect(() => {
    async function checkAvailability() {
      if (!model) {
        setIsUnavailable(false);
        return;
      }

      setIsChecking(true);
      try {
        const exists = await checkModelExists(model);
        setIsUnavailable(!exists);
      } catch (error) {
        console.error("Error checking model availability:", error);
        setIsUnavailable(true);
      } finally {
        setIsChecking(false);
      }
    }

    checkAvailability();
  }, [model, checkModelExists]);

  return { isUnavailable, isChecking };
}
