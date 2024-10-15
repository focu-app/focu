'use client'

import { CheckIcon } from '@heroicons/react/20/solid'

interface Tier {
  name: string
  id: string
  href: string
  price: string
  discount?: string
  description: string
  features: string[]
  mostPopular: boolean
}

const tiers: Tier[] = [
  {
    name: 'Individual',
    id: 'tier-individual',
    href: '#',
    price: '$0',
    discount: '$19',
    description: 'For when you only have one device',
    features: ['1 Device', 'Local AI', 'Focus Page', 'Pomodoro Timer', 'Keyboard Shortcuts'],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: '$0',
    discount: '$29',
    description: 'For when you have multiple devices',
    features: ['3 Devices', 'Local AI', 'Focus Page', 'Pomodoro Timer', 'Keyboard Shortcuts'],
    mostPopular: true,
  },
]

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Pricing() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="bg-blue-600 py-3 px-6 mb-8 text-center">
        <p className="text-white font-semibold text-lg">Pay what you want while the app is in early access</p>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Choose the perfect plan for individuals and teams. No hidden fees.
        </p>
        
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'bg-gray-800 ring-2 ring-indigo-500' : 'bg-gray-800 ring-1 ring-gray-700',
                'rounded-3xl p-8 xl:p-10',
              )}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
                  {tier.name}
                </h3>
                {tier.mostPopular ? (
                  <p className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                    Most popular
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                {tier.discount && (
                  <span className="ml-2 text-md line-through text-gray-500">{tier.discount}</span>
                )}
                <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-300">/once</span>
              </div>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500'
                    : 'bg-gray-700 text-white hover:bg-gray-600 focus-visible:outline-gray-600',
                  'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                )}
              >
                Get started
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
