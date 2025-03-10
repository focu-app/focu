import {
  BellIcon,
  CloudIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  KeyIcon,
  ShieldCheckIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

interface FeatureItem {
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  heading: string;
  description: string;
  gradient: string;
}

const featureItems: FeatureItem[] = [
  {
    icon: ComputerDesktopIcon,
    title: "Focus Page",
    heading: "A focus page with a task list and pomodoro timer",
    description:
      "Input tasks yourself or use AI to extract them from your conversations.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: BellIcon,
    title: "Pomodoro Timer",
    heading: "Always in your menu bar",
    description:
      "The built-in pomodoro timer lives in your menu bar, so you can focus on your work.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: CommandLineIcon,
    title: "Extract Tasks",
    heading: "Extract tasks automatically",
    description:
      "AI can extract tasks from your conversations and add them to your task list.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: KeyIcon,
    title: "Keyboard Shortcuts",
    heading: "Be more productive with keyboard shortcuts",
    description:
      "With keyboard shortcuts, you can focus on your work and avoid distractions.",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: ShieldCheckIcon,
    title: "Data Protection",
    heading: "Automatic data backups",
    description:
      "Your data never leaves your device. Configure automatic backups to your preferred location, such as iCloud, with easy import/export options.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: CloudIcon,
    title: "Customizable AI",
    heading: "Local and cloud AI options",
    description:
      "Focu works out of the box using local AI, with support for cloud AI via OpenAI or OpenRouter using your own API key.",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    icon: SunIcon,
    title: "Dark & Light Mode",
    heading: "Automatic dark or light mode",
    description: "Choose your preferred mode or let the app decide for you.",
    gradient: "from-gray-500 to-slate-600",
  },
  {
    icon: CpuChipIcon,
    title: "Privacy First",
    heading: "Runs completely locally",
    description: "All your data stays on your machine, even the AI processing.",
    gradient: "from-indigo-500 to-blue-600",
  },
];

function getCornerStyle(index: number, totalItems: number): string {
  const columns = 4;
  const rows = Math.ceil(totalItems / columns);

  // Top row corners
  if (index === 0) return "rounded-tl-2xl";
  if (index === columns - 1) return "rounded-tr-2xl";

  // Bottom row corners
  if (index === totalItems - columns) return "rounded-bl-2xl";
  if (index === totalItems - 1) return "rounded-br-2xl";

  return "";
}

export function FeatureBento() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">
            Features
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need during the day.
          </p>
          <p className="my-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
            From morning to evening, Focu is there to help you stay focused and
            productive.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`overflow-hidden bg-gray-800 ring-1 ring-white/15 p-6 ${getCornerStyle(index, featureItems.length)}`}
              >
                <div className="flex justify-center mb-6">
                  <div
                    className={`bg-gradient-to-br ${item.gradient} p-4 rounded-xl`}
                  >
                    <Icon className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  {item.title}
                </h3>
                <p className="text-lg font-medium tracking-tight text-white mb-3">
                  {item.heading}
                </p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
