import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <HowItWorks />
      <CTA />
    </>
  );
}
