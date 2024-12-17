import { Breadcrumbs } from "@/components/breadcrumbs";
import { allBlogPosts } from "content-collections";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest Focu news and updates",
};

export default function BlogPage() {
  const breadcrumbItems = [{ name: "Blog", href: "/blog" }];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Blog
        </h1>
        <h3 className="text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
          Latest news and updates from Focu
        </h3>
        <hr className="my-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogPosts
            .sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime(),
            )
            .map((blogPost) => (
              <div className="flex flex-col gap-4" key={blogPost.slug}>
                <Link href={`/blog/${blogPost.slug}`} className="group">
                  <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
                    <Image
                      src={blogPost.featuredImage}
                      alt={blogPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight text-white group-hover:text-gray-300 transition-colors">
                    {blogPost.title}
                  </h2>
                </Link>
                <p className="text-pretty text-base text-gray-400">
                  {blogPost.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-sm text-gray-400">
                  <span>{blogPost.author}</span>
                  <span>•</span>
                  <time dateTime={blogPost.publishedAt}>
                    {new Date(blogPost.publishedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </time>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
