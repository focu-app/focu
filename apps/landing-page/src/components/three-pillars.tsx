import React from 'react';
import { SunIcon, MagnifyingGlassIcon , MoonIcon } from '@heroicons/react/24/outline';

const pillars = [
  {
    icon: SunIcon,
    title: 'Morning Intention',
    description: 'Set your intention in the morning and get in the right mindset',
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Daytime Focus',
    description: 'Focus during the day and get things done',
  },
  {
    icon: MoonIcon,
    title: 'Evening Reflection',
    description: 'Wind down, reflect on your day and make tomorrow even better',
  },
];

export function ThreePillars() {
  return (
    <section className="py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Three Key Pillars
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-pretty font-medium text-gray-400 sm:text-xl/8">

          Focu operates on three simple key pillars to help you have a productive day.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {pillars.map((pillar, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-gray-700 p-4 rounded-full mb-4">
                <pillar.icon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{pillar.title}</h3>
              <p className="text-gray-300">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
