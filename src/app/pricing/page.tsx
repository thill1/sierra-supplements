import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Protocol stacks",
    description: `${siteConfig.name} – Custom supplement protocol stacks. Contact us to get started.`,
};

export default function PricingPage() {
    return (
        <div className="pt-24 min-h-[60vh] flex items-center justify-center">
            <section className="section-container section-padding text-center max-w-xl">
                <span className="label">Custom protocols</span>
                <h1 className="heading-xl mt-2 mb-4">
                    Level Up With{" "}
                    <span className="gradient-text">
                        Custom Supplement Protocol Stacks
                    </span>
                </h1>
                <p className="body-lg text-[var(--color-text-secondary)] mb-8">
                    Tell us about your goals and we&apos;ll help you design a stack that fits—
                    whether you&apos;re training, recovering, or optimizing day-to-day wellness.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" className="btn btn-primary inline-flex items-center gap-2">
                        Contact Us Today <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/store" className="btn btn-secondary inline-flex items-center gap-2">
                        Shop Supplements
                    </Link>
                    <Link href="/book" className="btn btn-secondary">
                        Book Free Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}
