"use client";

import { Star, Quote } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";

export function TestimonialsSection() {
    return (
        <section className="section-padding bg-[var(--color-bg-elevated)]">
            <div className="section-container">
                <FadeIn className="text-center mb-12">
                    <span className="label">What Our Clients Say</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Real Results,{" "}
                        <span className="gradient-text">Real People</span>
                    </h2>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {siteConfig.testimonials.map((t, i) => (
                        <StaggerItem key={i}>
                            <div className="card h-full flex flex-col">
                                <Quote className="w-8 h-8 text-[var(--color-accent)] opacity-30 mb-4" />
                                <p className="text-[var(--color-text-secondary)] mb-6 flex-grow italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center">
                                        <span className="text-sm font-bold text-[var(--color-accent)]">
                                            {t.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{t.name}</div>
                                        <div className="body-sm">{t.role}</div>
                                    </div>
                                    <div className="ml-auto flex gap-0.5">
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <Star
                                                key={j}
                                                className="w-4 h-4 fill-[var(--color-accent)] text-[var(--color-accent)]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
