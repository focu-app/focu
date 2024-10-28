import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const features = defineCollection({
  name: "features",
  directory: "content/features",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
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

export default defineConfig({
  collections: [features],
});
