'use client'

import { LightBulbIcon, RocketLaunchIcon, BellIcon, BeakerIcon, NoSymbolIcon, BookOpenIcon } from "@heroicons/react/24/outline";

const useCases = [
  {
    title: "Kickstart Your Day",
    description: "For people who struggle to get started with the right thing to work on",
    icon: RocketLaunchIcon,
  },
  {
    title: "Find Your Focus",
    description: "For people who get easily distracted and need to refocus",
    icon: LightBulbIcon,
  },
  {
    title: "Stay on Track",
    description: "For people who need to stay on track with their daily goals",
    icon: NoSymbolIcon,
  },
  {
    title: "Timely Reminders",
    description: "For people who get need reminders throughout the day",
    icon: BellIcon,
  },
  {
    title: "Clear Your Mind",
    description: "For people who need to wind down and clear their mind",
    icon: BeakerIcon,
  },
  {
    title: "Learn Productivity Methods",
    description: "The AI is pre-configured to teach you productivity methods that suit you",
    icon: BookOpenIcon,
  }
];

interface UseCaseCardProps {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

function UseCaseCard({ title, description, icon: Icon }: UseCaseCardProps) {
  return (
    <div className="flex flex-col items-center p-6 border-2 border-gray-700 bg-gray-800 rounded-lg shadow-md hover:border-indigo-500 hover:shadow-lg">
      <Icon className="w-12 h-12 text-indigo-400 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 text-center">{description}</p>
    </div>
  );
}

export function UseCases() {
  return (
    <div className="py-24 bg-gray-900 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Use Cases
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Discover how our app can help you in various scenarios
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.title} {...useCase} />
          ))}
        </div>
      </div>
    </div>
  );
}
