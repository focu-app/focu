import { FAQ } from '@/components/faq'
import { FeatureBento } from '@/components/feature-bento'
import { LogoCloud } from '@/components/logo-cloud'
import { Pricing } from '@/components/pricing'
import { ThreePillars } from '@/components/three-pillars'
import { UseCases } from '@/components/use-cases'
import Image from 'next/image'
import homescreen from '@/images/homescreen.png'
import { DownloadButton } from '@/components/download-button'
import { Demo } from '@/components/demo'
import { Header } from '@/components/header'
import { KeyboardShortcutsDemo } from '@/components/keyboard-shortcuts-demo'
import { BottomCTA } from '@/components/bottom-cta'


export default function Page() {
  return (
    <main>
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:flex lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="">
              <a href="#pricing" className="inline-flex space-x-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  Free trial, no credit card required
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your Personal AI Productivity Coach
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Improve your daily routine with intelligent morning planning, focused work sessions, and mindful evening reflection. Runs privately on your Mac and is there with just a click.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <DownloadButton />
              <a href="#pricing" className="text-sm font-semibold leading-6 text-white">
                Buy Now <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-16">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <Image
                alt="App screenshot"
                src={homescreen}
                width={1020}
                height={778}
                className="w-[1020px] rounded-md bg-white/5 shadow-1xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <Demo /> 
      <ThreePillars />
      <FeatureBento />
      <UseCases />
      <KeyboardShortcutsDemo />
      <Pricing />
      <LogoCloud />
      <FAQ />

      <BottomCTA />
    </main>
  )
}
