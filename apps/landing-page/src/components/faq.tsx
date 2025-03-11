import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "What is Focu?",
    answer:
      "Focu is a productivity app that helps you work through your thoughts and emotions to get things done. There are three key pillars: figure out what you need to do, get things done, and reflect on what you've done.",
  },
  {
    question: "Why not just use ChatGPT?",
    answer:
      "ChatGPT is a general-purpose AI, which means you could instruct ChatGPT to behave similar to Focus. However, Focus is designed to work out of the box. On top of that, Focus runs locally on your own Mac, which means no internet connection required and your data stays private. Focus is available for a one-time purchase whereas ChatGPT requires a subscription.",
  },
  {
    question: "What AI options does Focu support?",
    answer:
      "Focu runs AI locally by default using Ollama, keeping your data private and working offline. Now, you can also connect to cloud AI services like OpenAI (GPT-4) or OpenRouter using your own API key while maintaining control of your data.",
  },
  {
    question: "Is Focu for me?",
    answer:
      "Focu is meant for people who want help getting things done. Whether you're easily distracted, forgetful, or struggle to figure out what to work on, Focu can help.",
  },
  {
    question: "Can Focu solve all my productivity problems?",
    answer:
      "Focu is not a magic bullet. It won't solve all your productivity problems. Focu puts a big emphasis on the human side of productivity by leveraging AI and your own thoughts to help you get things done.",
  },
  {
    question: "On which devices can I use Focu?",
    answer:
      "Focu is currently only available on MacOS Silicon (M-series chips).",
  },
  {
    question: "How does Focu respect my privacy?",
    answer:
      "Focu does not collect any data from the user. All data is stored locally on your device. AI features are running on your own machine and work even offline.",
  },
  {
    question: "How does Focu protect my data?",
    answer:
      "All data stays on your device—never on our servers. Focu offers automatic backups with configurable intervals, letting you choose the backup location and retention. You have complete control over your information.",
  },
];

export function FAQ() {
  return (
    <div className="bg-gray-900" id="faq">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-white/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-white">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="pt-6">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                    <span className="text-base font-semibold leading-7">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusSmallIcon
                        aria-hidden="true"
                        className="h-6 w-6 group-data-[open]:hidden"
                      />
                      <MinusSmallIcon
                        aria-hidden="true"
                        className="h-6 w-6 [.group:not([data-open])_&]:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base leading-7 text-gray-300">
                    {faq.answer}
                  </p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
