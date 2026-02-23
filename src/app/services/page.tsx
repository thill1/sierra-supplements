import Link from "next/link";
import {
    Dumbbell,
    Apple,
    TestTube,
    Users,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Services",
    description: `Explore ${siteConfig.name}'s full range of wellness services — from custom supplement plans to nutrition coaching and more.`,
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Dumbbell,
    Apple,
    TestTube,
    Users,
    ShoppingBag,
};

export default function ServicesPage() {
    return (
        <div className="pt-24">
            {/* Hero */}
            <section className="section-container section-padding text-center">
                <span className="label">Our Services</span>
                <h1 className="heading-xl mt-2 mb-4">
                    Everything You Need to{" "}
                    <span className="gradient-text">Thrive</span>
                </h1>
                <p className="body-lg max-w-2xl mx-auto">
                    Whether you&apos;re a weekend warrior or a competitive athlete, we
                    have a service designed to elevate your performance.
                </p>
            </section>

            {/* Services */}
            <section className="section-container pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {siteConfig.services.map((service) => {
                        const Icon = iconMap[service.icon] || Dumbbell;
                        return (
                            <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                className="card group flex flex-col md:flex-row gap-6"
                            >
                                <div className="w-16 h-16 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-accent)] transition-colors">
                                    <Icon className="w-8 h-8 text-[var(--color-accent)] group-hover:text-[var(--color-bg)] transition-colors" />
                                </div>
                                <div>
                                    <h2 className="heading-sm mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {service.title}
                                    </h2>
                                    <p className="body-sm mb-3">{service.shortDescription}</p>
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2 transition-all">
                                        Learn More <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container text-center">
                    <h2 className="heading-md mb-4">
                        Not sure where to start?
                    </h2>
                    <p className="body-lg mb-6 max-w-lg mx-auto">
                        Book a free consultation and we&apos;ll help you find the perfect
                        service for your goals.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
