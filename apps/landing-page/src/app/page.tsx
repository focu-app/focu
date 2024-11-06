import { BottomCTA } from "@/components/bottom-cta";
import { Compare } from "@/components/compare";
import { Demo } from "@/components/demo";
import { FAQ } from "@/components/faq";
import { FeatureBento } from "@/components/feature-bento";
import { Hero } from "@/components/hero";
import { KeyboardShortcutsDemo } from "@/components/keyboard-shortcuts-demo";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import { Problems } from "@/components/problems";
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
      {/* <Demo /> */}
      {/* <ThreePillars /> */}
      <FeatureBento />
      {/* <Testimonials /> */}
      <UseCases />
      {/* <KeyboardShortcutsDemo /> */}
      <Pricing />
      <LogoCloud />
      <FAQ />
      <BottomCTA />
    </main>
  );
}
