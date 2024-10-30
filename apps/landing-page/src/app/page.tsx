import { AppVersionBanner } from "@/components/app-version-banner";
import { BottomCTA } from "@/components/bottom-cta";
import { Demo } from "@/components/demo";
import { DownloadButton } from "@/components/download-button";
import { FAQ } from "@/components/faq";
import { FeatureBento } from "@/components/feature-bento";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { KeyboardShortcutsDemo } from "@/components/keyboard-shortcuts-demo";
import { LogoCloud } from "@/components/logo-cloud";
import { Pricing } from "@/components/pricing";
import { ThreePillars } from "@/components/three-pillars";
import { UseCases } from "@/components/use-cases";
import homescreen from "@/images/homescreen.png";
import { getLatestRelease } from "@/lib/get-latest-release";
import Image from "next/image";

export default async function Page() {
  return (
    <main>
      <Hero />
      <Demo />
      <ThreePillars />
      <FeatureBento />
      <UseCases />
      <KeyboardShortcutsDemo />
      <Pricing />
      <LogoCloud />
      <FAQ />

      <BottomCTA />
    </main>
  );
}
