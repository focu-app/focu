"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    person_profiles: "always",
  });
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
  }

  return <>{children}</>;
}
