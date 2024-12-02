import { BottomCTA } from "@/components/bottom-cta";
import { Pricing } from "@/components/pricing";
import SenjaTestimonials from "@/components/senja-testimonials";
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
      <div className="pt-36 max-w-screen-lg mx-auto relative">
        <SenjaTestimonials />
        <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-gray-900" />
      </div>
      <BottomCTA />
    </div>
  );
}
