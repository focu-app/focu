import Ollama from "./ollama";
import { Button } from "@repo/ui/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <Ollama />
    </main>
  );
}
