"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";

export function PricingTeaser() {
    return (
        <section className="section-padding" id="pricing">
            <div className="section-container">
                <FadeIn className="text-center mb-12">
                    <span className="label">Membership Plans</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Choose Your{" "}
                        <span className="gradient-text">Elevation</span>
                    </h2>
                    <p className="body-lg max-w-2xl mx-auto">
                        From essential supplements to full-service performance optimization.
                        Every plan includes free shipping and a 30-day money-back guarantee.
                    </p>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {siteConfig.pricing.map((tier) => (
                        <StaggerItem key={tier.name}>
                            <div
                                className={`card h-full flex flex-col ${tier.highlighted ? "card-highlighted" : ""
                                    }`}
                            >
                                {tier.highlighted && (
                                    <span className="label text-xs mb-3">⭐ Most Popular</span>
                                )}
                                <h3 className="heading-sm">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mt-3 mb-2">
                                    <span
                                        className="text-4xl font-bold"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        ${tier.price}
                                    </span>
                                    <span className="body-sm">{tier.period}</span>
                                </div>
                                <p className="body-sm mb-6">{tier.description}</p>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {tier.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/book"
                                    className={`btn w-full ${tier.highlighted ? "btn-primary" : "btn-secondary"
                                        }`}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                <FadeIn className="text-center mt-8">
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 text-[var(--color-accent)] font-medium hover:gap-2.5 transition-all"
                    >
                        Compare all features <ArrowRight className="w-4 h-4" />
                    </Link>
                </FadeIn>
            </div>
        </section>
    );
}
