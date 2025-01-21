"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      persistence: "memory",
      ui_host: "https://eu.posthog.com",
      person_profiles: "always",
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
