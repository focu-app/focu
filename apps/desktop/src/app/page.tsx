import Ollama from "./ollama";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Ollama />
    </main>
  );
}
