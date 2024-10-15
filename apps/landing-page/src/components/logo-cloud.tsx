import ollamaLogo from "../images/ollama.svg";
import geminiLogo from "../images/gemini.svg";
import llamaLogo from "../images/llama.svg";
import Image from "next/image";

export function LogoCloud() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-white">
          Powered by the latest open-source LLM software
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 items-center gap-x-8 gap-y-10">
          <Image src={ollamaLogo} alt="Ollama" />
          <Image src={geminiLogo} alt="Gemini" />
          <Image src={llamaLogo} alt="Llama" width={125} />
        </div>
      </div>
    </div>
  )
}
