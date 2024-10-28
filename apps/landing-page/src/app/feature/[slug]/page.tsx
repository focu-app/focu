import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allFeatures } from "content-collections";

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
    description: feature.summary,
  };
}

export const generateStaticParams = async () => {
  const paths = allFeatures.map((feature) => ({ slug: feature.slug }));

  return paths;
};

export default function Page({ params }: { params: { slug: string } }) {
  console.log(params, allFeatures);
  const feature = allFeatures.find((feature) => feature.slug === params.slug);
  if (!feature) {
    notFound();
  }
  return <div>{feature.title}</div>;
}
