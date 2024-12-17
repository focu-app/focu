import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const features = defineCollection({
  name: "features",
  directory: "content/features",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    featuredImage: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
      slug: document._meta.fileName.replace(/\.mdx$/, ""),
    };
  },
});

const legal = defineCollection({
  name: "legal",
  directory: "content/legal",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
      slug: document._meta.fileName.replace(/\.mdx$/, ""),
    };
  },
});

// Helper type for TOC items
type TocItem = {
  text: string;
  level: number;
  slug: string;
};

// Helper function to extract TOC from MDX content
function extractToc(content: string): TocItem[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const toc: TocItem[] = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const headerText = match[1];
    const level = match[0].split('#').length - 1;
    const slug = headerText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    toc.push({
      text: headerText,
      level,
      slug,
    });
  }

  return toc;
}

const blogPosts = defineCollection({
  name: "blogPost",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    featuredImage: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    const toc = extractToc(document.content);

    return {
      ...document,
      mdx,
      toc,
      slug: document._meta.fileName.replace(/\.mdx$/, ""),
    };
  },
});

export default defineConfig({
  collections: [features, legal, blogPosts],
});
