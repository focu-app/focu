import { BottomCTA } from "@/components/bottom-cta";
import { Demo } from "@/components/demo";
import { FAQ } from "@/components/faq";
import { FeatureBento } from "@/components/feature-bento";
import { Hero } from "@/components/hero";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import SenjaTestimonials from "@/components/senja-testimonials";
import { UseCases } from "@/components/use-cases";

export default async function Page() {
  return (
    <main>
      <Hero />
      <Demo />
      <FeatureBento />
      <UseCases />
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
