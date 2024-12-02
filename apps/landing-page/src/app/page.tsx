import { BottomCTA } from "@/components/bottom-cta";
import { Compare } from "@/components/compare";
import { Demo } from "@/components/demo";
import { FAQ } from "@/components/faq";
import { FeatureBento } from "@/components/feature-bento";
import FloatingBanner from "@/components/floating-banner";
import { Hero } from "@/components/hero";
import { KeyboardShortcutsDemo } from "@/components/keyboard-shortcuts-demo";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import { Problems } from "@/components/problems";
import SenjaTestimonials from "@/components/senja-testimonials";
import { Testimonial } from "@/components/testimonial";
import { Testimonials } from "@/components/testimonials";
import { ThreePillars } from "@/components/three-pillars";
import { UseCases } from "@/components/use-cases";

export default async function Page() {
  return (
    <main>
      <Hero />
      <Testimonial />
      {/* <Problems /> */}
      {/* <Compare /> */}
      <Demo />
      {/* <ThreePillars /> */}
      <FeatureBento />
      {/* <Testimonials /> */}
      <UseCases />
      {/* <KeyboardShortcutsDemo /> */}
      <div className="py-24">
        <Pricing />
      </div>
      <div className="py-24 max-w-screen-lg mx-auto relative">
        <SenjaTestimonials />
        <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-gray-900" />
      </div>
      <LogoCloud />
      <FAQ />
      <BottomCTA />
    </main>
  );
}
