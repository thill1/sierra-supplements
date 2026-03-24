"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function PricingTeaser() {
    return (
        <section className="section-padding" id="pricing">
            <div className="section-container">
                <FadeIn className="text-center max-w-3xl mx-auto">
                    <span className="label">Performance protocols</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Performance{" "}
                        <span className="gradient-text">Protocols</span>
                    </h2>
                    <p className="body-lg text-[var(--color-text-secondary)] mb-8">
                        Body builder approved—personalized stacks built around your goals, with
                        room to adjust as you level up.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/contact" className="btn btn-primary px-10">
                            Contact Us Today
                        </Link>
                        <Link
                            href="/book"
                            className="inline-flex items-center gap-1.5 text-[var(--color-accent)] font-medium hover:gap-2.5 transition-all"
                        >
                            Or book a free consultation{" "}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
