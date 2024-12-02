import Script from "next/script";

// const widgetId = "eadbf493-1382-4374-9162-5b740d784ff9";
const widgetId = "081c7b3e-0f26-456f-95f8-c8926a3346f9";

export default function SenjaTestimonials() {
  return (
    <>
      <Script
        src={`https://widget.senja.io/widget/${widgetId}/platform.js`}
        type="text/javascript"
        async
      />
      <div
        className="senja-embed"
        data-id={widgetId}
        data-mode="shadow"
        data-lazyload="false"
        style={{ display: "block" }}
      />
    </>
  );
}
