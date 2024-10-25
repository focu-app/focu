import Image from "next/image";
import FocusImage from "@/images/focus.png";
import PomodoroImage from "@/images/menu-bar-3.png";
import ExtractTasksImage from "@/images/extract-tasks.png";
import KeyboardShortcutsImage from "@/images/keyboard-shortcuts.png";
import LightModeImage from "@/images/light-mode.png";
import CustomizableImage from "@/images/customizable.png";

interface FeatureItem {
  image: any;
  title: string;
  heading: string;
  description: string;
}

const featureItems: FeatureItem[] = [
  {
    image: FocusImage,
    title: "Focus Page",
    heading: "A focus page with a task list and pomodoro timer",
    description: "Input tasks yourself or use AI to extract them from your conversations.",
  },
  {
    image: PomodoroImage,
    title: "Pomodoro Timer",
    heading: "Always in your menu bar",
    description: "The built-in pomodoro timer lives in your menu bar, so you can focus on your work."
  },
  {
    image: ExtractTasksImage,
    title: "Extract Tasks",
    heading: "Extract tasks automatically",
    description: "AI can extract tasks from your conversations and add them to your task list.",
  },
  {
    image: KeyboardShortcutsImage,
    title: "Keyboard Shortcuts",
    heading: "Be more productive with keyboard shortcuts",
    description: "With keyboard shortcuts, you can focus on your work and avoid distractions.",
  },
  {
    image: LightModeImage,
    title: "Dark & Light Mode",
    heading: "Automatic dark or light mode",
    description: "Choose your preferred mode or let the app decide for you."
  },
  {
    image: CustomizableImage,
    title: "Customizable",
    heading: "Customize the app to your liking",
    description: "Focu works out of the box but advanced users can choose their own AI models and set the system prompts.",
  }
];

function getCornerStyle(index: number): string {
  switch (index) {
    case 0:
      return "max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]";
    case 2:
      return "lg:rounded-tr-[2rem]";
    case 3:
      return "max-lg:rounded-b-[2rem] lg:rounded-bl-[2rem]";
    case 5:
      return "lg:rounded-br-[2rem]";
    default:
      return "";
  }
}

export function FeatureBento() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Features</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need during the day.
          </p>
          <p className="my-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
            From morning to evening, Focu is there to help you stay focused and productive.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          {featureItems.map((item, index) => (
            <div key={index} className="flex p-px lg:col-span-2">
              <div className={`overflow-hidden rounded-lg bg-gray-800 ring-1 ring-white/15 ${getCornerStyle(index)}`}>
                <div className="overflow-hidden rounded-lg h-72 w-full">
                  <Image 
                    alt=""
                    src={item.image}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-10">
                  <h3 className="text-sm/4 font-semibold text-gray-400">{item.title}</h3>
                  <p className="mt-2 text-lg/7 font-medium tracking-tight text-white">
                    {item.heading}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
