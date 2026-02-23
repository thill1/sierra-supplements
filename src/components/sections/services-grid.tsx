"use client";

import Link from "next/link";
import {
    Dumbbell,
    Apple,
    TestTube,
    Users,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Dumbbell,
    Apple,
    TestTube,
    Users,
    ShoppingBag,
};

export function ServicesGrid() {
    return (
        <section className="section-padding" id="services">
            <div className="section-container">
                <FadeIn className="text-center mb-12">
                    <span className="label">What We Offer</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Peak Performance <span className="gradient-text">Services</span>
                    </h2>
                    <p className="body-lg max-w-2xl mx-auto">
                        From custom supplement plans to nutrition coaching and wellness testing,
                        we offer everything you need to perform at your best in the mountains and beyond.
                    </p>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {siteConfig.services.map((service) => {
                        const Icon = iconMap[service.icon] || Dumbbell;
                        return (
                            <StaggerItem key={service.slug}>
                                <Link
                                    href={`/services/${service.slug}`}
                                    className="card group block h-full"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)] transition-colors">
                                        <Icon className="w-6 h-6 text-[var(--color-accent)] group-hover:text-[var(--color-bg)] transition-colors" />
                                    </div>
                                    <h3 className="heading-sm mb-2">{service.title}</h3>
                                    <p className="body-sm mb-4">{service.shortDescription}</p>
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2 transition-all">
                                        Learn More <ArrowRight className="w-4 h-4" />
                                    </span>
                                </Link>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            </div>
        </section>
    );
}
