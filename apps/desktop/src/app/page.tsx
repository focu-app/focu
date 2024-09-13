import Ollama from "./ollama";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <Ollama />
    </main>
  );
}
