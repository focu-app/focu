import { useOllamaStore } from "@/app/store";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";

export default function StartOllamaButton() {
  const { startOllama, checkOllamaStatus, isOllamaRunning } = useOllamaStore();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await startOllama();
  };

  useEffect(() => {
    if (isOllamaRunning) {
      setLoading(false);
      return;
    }
    const timeout = setInterval(() => {
      checkOllamaStatus();
    }, 1000);
    return () => clearInterval(timeout);
  }, [isOllamaRunning, checkOllamaStatus]);

  return (
    <Button onClick={onClick} disabled={isOllamaRunning || loading}>
      {loading ? "Starting..." : "Start Ollama"}
    </Button>
  );
}
