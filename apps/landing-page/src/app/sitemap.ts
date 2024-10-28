import type { MetadataRoute } from 'next'
import { allFeatures } from "content-collections";

export default function sitemap(): MetadataRoute.Sitemap {
  const features = allFeatures.map((post) => ({
    url: `https://focu.app/feature/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  // intended for all other routes, currently only homepage
  const routes = ["", "/feature"].map((route) => ({
    url: `https://focu.app${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [
    ...features,
    ...routes,
  ]
}