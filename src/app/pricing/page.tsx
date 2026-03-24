import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Performance protocols",
    description: `${siteConfig.name} – Body builder approved performance protocols and personalized supplement stacks. Contact us to get started.`,
};

export default function PricingPage() {
    return (
        <div className="pt-24 min-h-[60vh] flex items-center justify-center">
            <section className="section-container section-padding text-center max-w-xl">
                <span className="label">Performance protocols</span>
                <h1 className="heading-xl mt-2 mb-4">
                    Performance{" "}
                    <span className="gradient-text">Protocols</span>
                </h1>
                <p className="body-lg text-[var(--color-text-secondary)] mb-8">
                    Body builder approved—personalized stacks built around your goals, with room
                    to adjust as you level up.
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
