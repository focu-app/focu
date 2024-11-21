import { MDXContent } from "@content-collections/mdx/react";
import { allBlogPosts } from "content-collections";
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
  const blogPost = allBlogPosts.find(
    (blogPost) => blogPost.slug === params.slug,
  );
  if (!blogPost) {
    return;
  }

  return {
    title: blogPost.title,
    description: blogPost.description,
  };
}

export const generateStaticParams = async () => {
  const paths = allBlogPosts.map((blogPost) => ({ slug: blogPost.slug }));

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
  const blogPost = allBlogPosts.find(
    (blogPost) => blogPost.slug === params.slug,
  );
  if (!blogPost) {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Blog", href: "/blog" },
    { name: blogPost.title, current: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {blogPost.title}
        </h1>
        <p className="mt-8 hidden text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          {blogPost.description}
        </p>
        <div className="flex flex-col gap-6 mt-6">
          <section className="max-w-full prose prose-md prose-img:rounded-lg prose-invert">
            <MDXContent code={blogPost.mdx} components={components} />
          </section>
        </div>
      </div>
    </div>
  );
}
