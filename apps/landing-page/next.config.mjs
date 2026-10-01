import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/demo",
        destination: "/",
        permanent: true,
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: "/va-ingest/:match*",
        destination: "https://focu.app/_vercel/insights/:match*",
      },
    ];
  },
};

export default withContentCollections(nextConfig);
