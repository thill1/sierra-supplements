"use client";

import { FadeIn } from "@/components/ui/motion";
import { Accordion } from "@/components/ui/accordion";
import { siteConfig } from "@/lib/site-config";

export function FaqSection() {
    return (
        <section className="section-padding" id="faq">
            <div className="section-container max-w-3xl">
                <FadeIn className="text-center mb-12">
                    <span className="label">FAQ</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Common <span className="gradient-text">Questions</span>
                    </h2>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <Accordion items={siteConfig.faqs} />
                </FadeIn>
            </div>
        </section>
    );
}
