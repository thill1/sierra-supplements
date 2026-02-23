import Link from "next/link";
import {
  ArrowRight,
  Star,
  Shield,
  CheckCircle,
  Dumbbell,
  Apple,
  TestTube,
  Droplets,
  Users,
  ShoppingBag,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Accordion } from "@/components/ui/accordion";
import { HeroSection } from "@/components/sections/hero";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { ServicesGrid } from "@/components/sections/services-grid";
import { PricingTeaser } from "@/components/sections/pricing-teaser";
import { TrustSection } from "@/components/sections/trust-section";
import { FaqSection } from "@/components/sections/faq-section";
import { LeadMagnetBanner } from "@/components/sections/lead-magnet-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${siteConfig.name} – ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesGrid />
      <TestimonialsSection />
      <PricingTeaser />
      <LeadMagnetBanner />
      <FaqSection />
    </>
  );
}
