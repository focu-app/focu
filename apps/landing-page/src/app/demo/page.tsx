import { BottomCTA } from "@/components/bottom-cta";
import { Demo } from "@/components/demo";
import { Pricing } from "@/components/pricing";
import SenjaTestimonials from "@/components/senja-testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Focu App Demo",
  description: "Demonstration video for Focu App",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:px-8 lg:pt-20">
      <div className="flex flex-col gap-16 pt-8">
        <Demo />
      </div>
      <div className="flex flex-col gap-16 pt-8">
        <Pricing />
      </div>
      <div className="pt-36 max-w-screen-lg mx-auto relative">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl text-center">
          What our users say
        </h2>
        <div className="mt-10">
          <SenjaTestimonials />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-gray-900" />
      </div>
      <BottomCTA />
    </div>
  );
}
