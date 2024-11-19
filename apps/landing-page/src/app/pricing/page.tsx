import { BottomCTA } from "@/components/bottom-cta";
import { Pricing } from "@/components/pricing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pricing for Focu App",
};

export default function FeaturePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-16 pt-8">
        <Pricing />
      </div>
      <BottomCTA />
    </div>
  );
}
