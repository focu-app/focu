import { MDXContent } from "@content-collections/mdx/react";
import { allBlogPosts } from "content-collections";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { format } from "date-fns";
import Link from "next/link";
import { TableOfContents } from "../components/table-of-contents";
import { BottomCTA } from "@/components/bottom-cta";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const Header = ({
  level,
  children,
}: { level: 1 | 2 | 3 | 4 | 5 | 6; children: React.ReactNode }) => {
  const slug = slugify(children?.toString() || "");
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag id={slug} className="group flex items-center">
      <Link href={`#${slug}`} className="not-prose">
        {children}
      </Link>
      <Link
        href={`#${slug}`}
        className="not-prose ml-2 opacity-0 group-hover:opacity-50 transition-opacity"
      >
        #
      </Link>
    </Tag>
  );
};

const components = {
  h1: (props: any) => <Header level={1} {...props} />,
  h2: (props: any) => <Header level={2} {...props} />,
  h3: (props: any) => <Header level={3} {...props} />,
  h4: (props: any) => <Header level={4} {...props} />,
  h5: (props: any) => <Header level={5} {...props} />,
  h6: (props: any) => <Header level={6} {...props} />,
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
        {/* TOC - Hidden on mobile, shown on left for desktop */}
        <div className="hidden lg:block lg:w-64">
          <div className="lg:sticky lg:top-24">
            <TableOfContents toc={blogPost.toc} />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:flex-1">
          {/* Header section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{blogPost.author}</span>
              <span>•</span>
              <time dateTime={blogPost.publishedAt}>
                {format(new Date(blogPost.publishedAt), "MMMM d, yyyy")}
              </time>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

            {/* Featured Image */}
            <div className="mt-8 aspect-[16/10] relative overflow-hidden rounded-lg">
              <Image
                src={blogPost.featuredImage}
                alt={blogPost.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Mobile TOC - Shown below summary */}
            <div className="mt-8 lg:hidden">
              <TableOfContents toc={blogPost.toc} />
            </div>
          </div>

          {/* Article content */}
          <article className="prose prose-lg prose-invert prose-img:rounded-lg max-w-none">
            <MDXContent code={blogPost.mdx} components={components} />
          </article>
        </div>
      </div>
      <BottomCTA />
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
