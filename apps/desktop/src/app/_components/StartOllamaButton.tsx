import { useOllamaStore } from "@/app/store";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";

export default function StartOllamaButton() {
  const {
    startOllama,
    stopOllama,
    checkOllamaStatus,
    isOllamaRunning,
    setIsOllamaRunning,
  } = useOllamaStore();
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

  const onClick = async () => {
    if (isOllamaRunning) {
      setStopping(true);
      await stopOllama();
    } else {
      setStarting(true);
      await startOllama();
    }
  };

  useEffect(() => {
    if (!starting && !stopping) {
      checkOllamaStatus().then(setIsOllamaRunning);
      return;
    }

    const checkStatus = async () => {
      const isRunning = await checkOllamaStatus();
      setIsOllamaRunning(isRunning);

      if (isRunning) {
        setStarting(false);
      }
      if (!isRunning) {
        setStopping(false);
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [checkOllamaStatus, setIsOllamaRunning, starting, stopping]);

  function getButtonText() {
    if (starting && !isOllamaRunning) return "Starting...";
    if (stopping && isOllamaRunning) return "Stopping...";
    if (!starting && !stopping && isOllamaRunning) return "Stop Ollama";
    return "Start Ollama";
  }

  return (
    <Button onClick={onClick} disabled={starting || stopping}>
      {getButtonText()}
    </Button>
  );
}
