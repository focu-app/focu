import Script from "next/script";

export const CustomAnalytics = () => {
  const isDev =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    window.location.hostname.endsWith("vercel.app");

  const src = isDev
    ? "https://va.vercel-scripts.com/v1/script.debug.js"
    : "/va-ingest/script.js";

  return (
    <>
      <Script id="va-ingest" strategy="afterInteractive">
        {
          "window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };"
        }
      </Script>
      <Script
        src={src}
        data-endpoint="/va-ingest"
        strategy="lazyOnload"
        async
      />
    </>
  );
};
