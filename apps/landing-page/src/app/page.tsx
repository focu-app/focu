import { BottomCTA } from "@/components/bottom-cta";
import { Demo } from "@/components/demo";
import { FAQ } from "@/components/faq";
import { FeatureBento } from "@/components/feature-bento";
import { Hero } from "@/components/hero";
import { LogoCloud } from "@/components/logo-cloud";
import { Testimonials } from "@/components/testimonials";
import { UseCases } from "@/components/use-cases";

export default async function Page() {
  return (
    <main>
      <Hero />
      <Demo />
      <FeatureBento />
      <UseCases />
      <Testimonials />
      <LogoCloud />
      <FAQ />
      <BottomCTA />
    </main>
  );
}
