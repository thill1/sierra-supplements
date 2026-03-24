"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function PricingTeaser() {
    return (
        <section className="section-padding" id="pricing">
            <div className="section-container">
                <FadeIn className="text-center max-w-3xl mx-auto">
                    <span className="label">Custom protocols</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Level Up With{" "}
                        <span className="gradient-text">
                            Custom Supplement Protocol Stacks
                        </span>
                    </h2>
                    <p className="body-lg text-[var(--color-text-secondary)] mb-8">
                        Work with us to build a supplement stack aligned with your goals,
                        training, and lifestyle—then refine it as you progress.
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
