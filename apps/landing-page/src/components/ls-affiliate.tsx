import Script from "next/script";

declare global {
  interface Window {
    lemonSqueezyAffiliateConfig?: {
      store: string;
    };
  }
}

export function LemonSqueezyAffiliate() {
  return (
    <>
      <Script id="lemonsqueezy-config" strategy="beforeInteractive">
        {`window.lemonSqueezyAffiliateConfig = { store: "focu" };`}
      </Script>
      <Script
        src="https://lmsqueezy.com/affiliate.js"
        strategy="afterInteractive"
      />
    </>
  );
}
