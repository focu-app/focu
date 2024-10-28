import Image from "next/image";
import geminiLogo from "../images/gemini.svg";
import llamaLogo from "../images/llama.svg";
import llamacppLogo from "../images/llamacpp.svg";
import ollamaLogo from "../images/ollama.svg";

export function LogoCloud() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-4xl text-center font-bold tracking-tight text-white sm:text-5xl">
          Powered by open-source LLM software
        </h2>
        <p className="mt-4 text-center text-pretty text-sm text-gray-400 sm:text-xl/8">
          Focu does not require you to stay online or pay for a subscription,
          everything runs locally on your own Mac.
        </p>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10">
          <Image src={ollamaLogo} alt="Ollama" width={125 / 2} />
          <Image src={geminiLogo} alt="Gemini" width={125} />
          <Image src={llamaLogo} alt="Llama" width={125} />
          <Image src={llamacppLogo} alt="LlamaCPP" width={125} />
        </div>
      </div>
    </div>
  );
}
