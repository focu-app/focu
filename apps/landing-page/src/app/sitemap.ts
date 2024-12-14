import type { MetadataRoute } from 'next'
import { allFeatures, allLegals, allBlogPosts } from "content-collections";

export default function sitemap(): MetadataRoute.Sitemap {
  const features = allFeatures.map((post) => ({
    url: `https://focu.app/feature/${post.slug}`,
    lastModified: new Date(post.publishedAt).toISOString().split("T")[0],
  }));

  const legals = allLegals.map((post) => ({
    url: `https://focu.app/${post.slug}`,
    lastModified: new Date(post.publishedAt).toISOString().split("T")[0],
  }));

  const blogPosts = allBlogPosts.map((post) => ({
    url: `https://focu.app/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt).toISOString().split("T")[0],
  }));

  // intended for all other routes, currently only homepage
  const routes = ["", "/feature", "/blog"].map((route) => ({
    url: `https://focu.app${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [
    ...features,
    ...routes,
    ...legals,
    ...blogPosts,
  ]
}