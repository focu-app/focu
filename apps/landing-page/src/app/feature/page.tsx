import { Breadcrumbs } from "@/components/breadcrumbs";
import { allFeatures } from "content-collections";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description: "All Focu App features in one place",
};

export default function FeaturePage() {
  const breadcrumbItems = [{ name: "Features", href: "/feature" }];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex flex-col gap-16 pt-8">
        {allFeatures
          .sort(
            (a, b) =>
              new Date(a.publishedAt).getTime() -
              new Date(b.publishedAt).getTime(),
          )
          .map((feature) => (
            <div className="flex flex-col gap-2" key={feature.slug}>
              <Link
                href={`/feature/${feature.slug}`}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                {feature.title}
              </Link>
              <p className="text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
                {feature.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
