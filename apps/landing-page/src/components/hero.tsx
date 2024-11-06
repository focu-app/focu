import { AppVersionBanner } from "./app-version-banner";
import { DownloadButton } from "./download-button";
import Image from "next/image";
import homescreen from "@/images/v0.2/homescreen.png";
import { getLatestRelease } from "@/lib/get-latest-release";

const titles = [
  "Your Personal AI Productivity Coach",
  "The Mindful Productivity App",
];

const taglines = [
  "Stop wasting time and improve your daily routine with intelligent morning planning, focused work sessions, and mindful evening reflection",
  "Transform your relationship with work through AI-powered guidance, meaningful conversations, periodics check-ins and focused work sessions.",
];

export async function Hero() {
  const releaseData = await getLatestRelease();

  return (
    <div className="bg-gray-900">
      <div className="relative isolate">
        <div className="py-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mt-10 text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
                {titles[1]}
              </h1>
              <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
                {taglines[1]}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <DownloadButton releaseData={releaseData} />
                <a
                  href="#pricing"
                  className="text-sm font-semibold leading-6 text-white"
                >
                  Buy Now <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="mt-4 flex justify-center">
                <AppVersionBanner releaseData={releaseData} />
              </div>
            </div>

            <Image
              src={homescreen}
              alt="App screenshot"
              width={2432}
              height={1442}
              className="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
