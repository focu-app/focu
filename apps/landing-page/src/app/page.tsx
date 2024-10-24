import { FAQ } from '@/components/faq'
import { FeatureBento } from '@/components/feature-bento'
import { LogoCloud } from '@/components/logo-cloud'
import { Pricing } from '@/components/pricing'
import { ThreePillars } from '@/components/three-pillars'
import { UseCases } from '@/components/use-cases'
import {
  ChevronRightIcon,
} from '@heroicons/react/20/solid'
import Image from 'next/image'
import morningIntention from '@/images/morning-intention-2.png'
import homescreen from '@/images/homescreen.png'
import logo from '../images/logo.png'
import { Video } from '@/components/video'
import { Suspense } from 'react'
import Script from 'next/script'
import { DownloadButton } from '@/components/download-button'

const isProduction = process.env.NODE_ENV === "production";

const footerNavigation = {
  links: [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Pricing',
      href: '#pricing',
    },
    {
      name: 'Contact',
      href: 'mailto:support@focu.app',
    }
  ],
  social: [
    {
      name: 'X',
      href: 'https://x.com/martin_buur',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
  ],
}

export default function Example() {
  return (
    <div className="bg-gray-900">
      <main>
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:flex lg:px-8 lg:pt-40">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
              <div className="flex items-center gap-4">
                <Image src={logo} alt="Focu App" width={50} height={50} />
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Focu</h1>
              </div>
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="#pricing" className="inline-flex space-x-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    Early adopter discount
                  </span>

                  {/* <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-300">
                    <span>Free trial</span>
                    <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-500" />
                  </span> */}
                </a>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Stop wasting time and be productive
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Focu is an AI companion running on your Mac to help you make the most of your day. Start your day writing to feel better, get motivated and stay focused.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <DownloadButton />
                <a href="#pricing" className="text-sm font-semibold leading-6 text-white">
                  Buy Now
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
        <ThreePillars />

        <div className="mt-16 flex justify-center w-full" id="demo">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Focu in action
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
              Everything is running locally on your own Mac, it works offline and no data is ever sent to us.
            </p>
            <Suspense fallback={<p></p>}>
              <Video fileName="Focu Demo 6" />
            </Suspense>
          </div>
        </div>
        <FeatureBento />
        <UseCases />

        <div className="mt-16 flex justify-center w-full" id="demo">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Keyboard shortcuts
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
              Control the app with keyboard shortcuts and speed up your workflow.
            </p>
            <Suspense fallback={<p></p>}>
              <Video fileName="Focu Demo 3" />
            </Suspense>
          </div>
        </div>

        <Pricing />
        <LogoCloud />

        <FAQ />

        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40">
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          >
            <defs>
              <pattern
                x="50%"
                y={0}
                id="1d4240dd-898f-445f-932d-e2872fd12de3"
                width={200}
                height={200}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={0} className="overflow-visible fill-gray-800/20">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)" width="100%" height="100%" strokeWidth={0} />
          </svg>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start using Focu today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Free trial. No credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <DownloadButton />
            </div>
          </div>
        </div>
      </main>

      <footer aria-labelledby="footer-heading" className="relative">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-4 lg:px-8">
          <div className="border-t border-white/10 pt-8 flex flex-col items-center space-y-6">
            <div className="flex space-x-6">
              {footerNavigation.links.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-gray-400 hover:text-gray-300">
                  {item.name}
                </a>
              ))}
            </div>
            
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="h-6 w-6" />
                </a>
              ))}
            </div>
            
            <p className="text-xs text-gray-400">
              &copy; 2024 Focu App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {isProduction && (
        <Script
          strategy="afterInteractive"
          async
          defer
          src="https://sa.focu.app/latest.js"
          data-collect-dnt="true"
          data-hostname={"focu.app"}
        />
      )}
      {isProduction && (
        <Script
          strategy="afterInteractive"
          async
          defer
          src="https://sa.focu.app/auto-events.js"
          data-collect-dnt="true"
          data-full-urls="true"
          data-hostname={"focu.app"}
        />
      )}
    </div>
  )
}
