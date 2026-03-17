import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing",
    description: `${siteConfig.name} – Shop supplements and book a free consultation.`,
};

export default function PricingPage() {
    return (
        <div className="pt-24 min-h-[60vh] flex items-center justify-center">
            <section className="section-container section-padding text-center max-w-lg">
                <span className="label">Coming Soon</span>
                <h1 className="heading-xl mt-2 mb-4">
                    Membership Plans
                </h1>
                <p className="body-lg text-[var(--color-text-secondary)] mb-8">
                    We&apos;re designing membership options that fit your goals. In the meantime,
                    shop our store or book a free consultation to get personalized recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/store" className="btn btn-primary inline-flex items-center gap-2">
                        Shop Supplements <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/book" className="btn btn-secondary">
                        Book Free Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}
