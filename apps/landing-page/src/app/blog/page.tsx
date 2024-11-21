import { Breadcrumbs } from "@/components/breadcrumbs";
import { allBlogPosts } from "content-collections";
import type { Metadata } from "next";
import Link from "next/link";

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
        <div className="flex flex-col gap-16 pt-8">
          {allBlogPosts
            .sort(
              (a, b) =>
                new Date(a.publishedAt).getTime() -
                new Date(b.publishedAt).getTime(),
            )
            .map((blogPost) => (
              <div className="flex flex-col gap-2" key={blogPost.slug}>
                <Link
                  href={`/blog/${blogPost.slug}`}
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  {blogPost.title}
                </Link>
                <p className="text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
                  {blogPost.description}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
