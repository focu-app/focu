import { MDXContent } from "@content-collections/mdx/react";
import { allFeatures } from "content-collections";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BottomCTA } from "@/components/bottom-cta";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const feature = allFeatures.find((feature) => feature.slug === params.slug);
  if (!feature) {
    return;
  }

  return {
    title: feature.title,
    description: feature.description,
    openGraph: {
      url: `/feature/${feature.slug}`,
    },
  };
}

export const generateStaticParams = async () => {
  const paths = allFeatures.map((feature) => ({ slug: feature.slug }));

  return paths;
};

const components = {
  h2: (props: any) => (
    <h2
      className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
      {...props}
    />
  ),
  img: (props: any) => (
    <Image
      width={960}
      height={0}
      style={{
        height: "auto",
      }}
      className="rounded-lg"
      {...props}
    />
  ),
};

export default function Page({ params }: { params: { slug: string } }) {
  const feature = allFeatures.find((feature) => feature.slug === params.slug);
  if (!feature) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Features", href: "/feature" },
    { name: feature.title, current: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {feature.title}
        </h1>
        <p className="mt-8 hidden text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          {feature.description}
        </p>
        <div className="flex flex-col gap-6 mt-6">
          <section className="max-w-full prose prose-md prose-img:rounded-lg prose-invert">
            <MDXContent code={feature.mdx} components={components} />
          </section>
        </div>
        <BottomCTA />
      </div>
    </div>
  );
}
