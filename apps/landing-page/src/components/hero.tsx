import homescreen from "@/images/homescreen.png";
import { getLatestRelease } from "@/lib/get-latest-release";
import Image from "next/image";
import { AppVersionBanner } from "./app-version-banner";
import { DownloadButton } from "./download-button";

const titles = [
  "Your Personal AI Productivity Coach",
  "The Mindful Productivity App",
];

const taglines = [
  "Stop wasting time and improve your daily routine with intelligent morning planning, focused work sessions, and mindful evening reflection",
  "Transform your work day through AI-powered guidance, meaningful conversations, periodic check-ins and focused work sessions.",
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
              <h2 className="mt-8 text-pretty text-2xl font-medium text-gray-200">
                Leverage AI-guided journaling, smart check-ins, and thoughtful
                reflections to create a more balanced and productive workday.
                <br />
                100% private, runs locally and open source.
              </h2>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <DownloadButton releaseData={releaseData} eventCode="hero" />
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
