import { BottomCTA } from "@/components/bottom-cta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { allFeatures } from "content-collections";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description: "All Focu App features in one place",
  openGraph: {
    url: "/feature",
  },
};

export default function FeaturePage() {
  const breadcrumbItems = [{ name: "Features", href: "/feature" }];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Features
        </h1>
        <h3 className="text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          All Focu App features in one place
        </h3>
        <hr className="my-6 sm:my-8" />
        <div className="flex flex-col gap-12 sm:gap-16 pt-6 sm:pt-8">
          {allFeatures
            .sort(
              (a, b) =>
                new Date(a.publishedAt).getTime() -
                new Date(b.publishedAt).getTime(),
            )
            .map((feature) => (
              <div
                className="flex flex-col sm:flex-row gap-6 sm:gap-8"
                key={feature.slug}
              >
                <div className="flex-shrink-0 w-full sm:w-[412px]">
                  <div className="relative aspect-[412/362] w-full overflow-hidden rounded-lg">
                    <Link href={`/feature/${feature.slug}`}>
                      <Image
                        src={feature.featuredImage}
                        alt={feature.title}
                        width={412}
                        height={362}
                      />
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <Link
                    href={`/feature/${feature.slug}`}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white hover:text-gray-200 transition-colors"
                  >
                    {feature.title}
                  </Link>
                  <p className="text-pretty text-base sm:text-lg font-medium text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
      <BottomCTA />
    </div>
  );
}
