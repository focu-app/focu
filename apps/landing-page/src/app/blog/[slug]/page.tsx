import { MDXContent } from "@content-collections/mdx/react";
import { allBlogPosts } from "content-collections";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { format } from "date-fns";

function TableOfContents({
  toc,
}: { toc: Array<{ text: string; level: number; slug: string }> }) {
  return (
    <nav className="space-y-2">
      <p className="font-semibold text-white">Table of Contents</p>
      <div className="flex flex-col space-y-2">
        {toc.map((item) => (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

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
      <div className="flex flex-col lg:flex-row lg:gap-16">
        {/* TOC - Sticky on desktop, top on mobile */}
        <div className="order-2 mb-8 lg:order-1 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <TableOfContents toc={blogPost.toc} />
          </div>
        </div>

        {/* Main content */}
        <div className="order-3 lg:order-2 lg:flex-1">
          {/* Header section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{blogPost.author}</span>
              <span>•</span>
              <time dateTime={blogPost.publishedAt}>
                {format(new Date(blogPost.publishedAt), "MMMM d, yyyy")}
              </time>
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {blogPost.title}
            </h1>
            <p className="mt-4 text-pretty text-lg font-medium text-gray-400">
              {blogPost.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {blogPost.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-800 px-2 py-1 text-sm text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article content */}
          <article className="prose prose-lg prose-invert prose-img:rounded-lg max-w-none">
            <MDXContent code={blogPost.mdx} components={components} />
          </article>
        </div>
      </div>
    </div>
  );
}

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
    openGraph: {
      url: `/blog/${blogPost.slug}`,
    },
  };
}

export const generateStaticParams = async () => {
  const paths = allBlogPosts.map((blogPost) => ({ slug: blogPost.slug }));

  return paths;
};
