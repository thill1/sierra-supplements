import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Target, Award } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Case Studies",
    description: `See how ${siteConfig.name} has helped clients achieve their health and performance goals.`,
};

const caseStudies = [
    {
        slug: "trail-running-team",
        title: "How a Local Trail Running Team Cut Recovery Time by 40%",
        excerpt:
            "We helped the Tahoe Trail Blazers optimize their supplement stacks for high-altitude training.",
        result: "40% faster recovery",
        category: "Performance",
        icon: TrendingUp,
    },
    {
        slug: "corporate-wellness",
        title: "Building a Corporate Wellness Program for 200 Employees",
        excerpt:
            "A Reno tech company partnered with us to boost employee health and reduce sick days.",
        result: "32% fewer sick days",
        category: "Corporate",
        icon: Users,
    },
    {
        slug: "weight-loss-transformation",
        title: "From Plateau to Peak: One Client's 6-Month Transformation",
        excerpt:
            "After stalling for months, Maria combined our coaching and supplements to break through.",
        result: "28 lbs lost in 6 months",
        category: "Transformation",
        icon: Target,
    },
    {
        slug: "gym-partnership",
        title: "Partnering with Summit Fitness: A Gym Success Story",
        excerpt:
            "How we integrated supplement education and wellness programs into a local gym's member experience.",
        result: "85% member satisfaction",
        category: "Partnership",
        icon: Award,
    },
];

export default function CaseStudiesPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="text-center mb-12">
                    <span className="label">Case Studies</span>
                    <h1 className="heading-xl mt-2 mb-4">
                        Real <span className="gradient-text">Results</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        See how we&apos;ve helped clients and businesses achieve measurable
                        health and performance outcomes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {caseStudies.map((study) => (
                        <Link
                            key={study.slug}
                            href={`/case-studies/${study.slug}`}
                            className="card group block"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0">
                                    <study.icon className="w-6 h-6 text-[var(--color-accent)]" />
                                </div>
                                <div>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium">
                                        {study.category}
                                    </span>
                                    <h2 className="heading-sm mt-2 mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {study.title}
                                    </h2>
                                    <p className="body-sm mb-3">{study.excerpt}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[var(--color-accent)]">
                                            Result: {study.result}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2 transition-all">
                                            Read <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container text-center">
                    <h2 className="heading-md mb-4">
                        Want results like these?
                    </h2>
                    <p className="body-lg mb-6 max-w-lg mx-auto">
                        Every transformation starts with a conversation. Let&apos;s talk
                        about your goals.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
