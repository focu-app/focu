import { defineCollection, defineConfig } from "@content-collections/core";

const features = defineCollection({
  name: "features",
  directory: "content/features",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
  }),
  transform: (data) => {
    return {
      ...data,
      slug: data._meta.fileName.replace(/\.mdx$/, ""),
    };
  },
});

export default defineConfig({
  collections: [features],
});