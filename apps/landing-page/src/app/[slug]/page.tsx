import { MDXContent } from "@content-collections/mdx/react";
import { allLegals } from "content-collections";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const legal = allLegals.find((doc) => doc.slug === params.slug);
  if (!legal) {
    return;
  }

  return {
    title: legal.title,
    description: legal.description,
    openGraph: {
      url: `/${legal.slug}`,
    },
  };
}

export const generateStaticParams = async () => {
  const paths = allLegals.map((doc) => ({ slug: doc.slug }));

  return paths;
};

const components = {
  h2: (props: any) => (
    <h2
      className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
      {...props}
    />
  ),
};

export default function Page({ params }: { params: { slug: string } }) {
  const legal = allLegals.find((doc) => doc.slug === params.slug);
  if (!legal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {legal.title}
        </h1>
        <p className="mt-8 hidden text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          {legal.description}
        </p>
        <div className="flex flex-col gap-6 mt-6">
          <section className="max-w-full prose prose-md prose-img:rounded-lg prose-invert">
            <MDXContent code={legal.mdx} components={components} />
          </section>
        </div>
      </div>
    </div>
  );
}
