import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing",
    description: `Compare ${siteConfig.name} membership plans. From essential supplements to full-service performance optimization.`,
};

const allFeatures = [
    { label: "Monthly Supplement Box", tiers: [true, true, true] },
    { label: "Custom Supplement Protocol", tiers: [false, true, true] },
    { label: "Wellness Assessment", tiers: ["Basic", "Comprehensive", "Comprehensive"] },
    { label: "1-on-1 Coaching", tiers: [false, "Monthly", "Weekly"] },
    { label: "Lab Panel Review", tiers: [false, "Quarterly", "Monthly"] },
    { label: "Email Support", tiers: [true, true, true] },
    { label: "Priority Support", tiers: [false, true, true] },
    { label: "Direct Coach Messaging", tiers: [false, false, true] },
    { label: "Store Discount", tiers: ["10%", "15%", "20%"] },
    { label: "Group Challenges", tiers: [false, true, true] },
    { label: "Early Product Access", tiers: [false, false, true] },
];

export default function PricingPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding text-center">
                <span className="label">Pricing</span>
                <h1 className="heading-xl mt-2 mb-4">
                    Simple, Transparent{" "}
                    <span className="gradient-text">Pricing</span>
                </h1>
                <p className="body-lg max-w-2xl mx-auto mb-12">
                    No hidden fees, no contracts. Every plan includes free shipping and a
                    30-day money-back guarantee.
                </p>

                {/* Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                    {siteConfig.pricing.map((tier) => (
                        <div
                            key={tier.name}
                            className={`card text-left flex flex-col ${tier.highlighted ? "card-highlighted" : ""
                                }`}
                        >
                            {tier.highlighted && (
                                <span className="label text-xs mb-3">⭐ Most Popular</span>
                            )}
                            <h2 className="heading-sm">{tier.name}</h2>
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

                            <ul className="space-y-2 mb-6 flex-grow">
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
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="max-w-5xl mx-auto">
                    <h2 className="heading-md mb-8">Feature Comparison</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">
                                        Feature
                                    </th>
                                    {siteConfig.pricing.map((tier) => (
                                        <th
                                            key={tier.name}
                                            className="py-4 px-4 text-sm font-semibold text-center"
                                        >
                                            {tier.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allFeatures.map((feature, i) => (
                                    <tr
                                        key={feature.label}
                                        className={`border-b border-[var(--color-border-subtle)] ${i % 2 === 0 ? "bg-[var(--color-bg-elevated)]" : ""
                                            }`}
                                    >
                                        <td className="py-3 px-4 text-sm">{feature.label}</td>
                                        {feature.tiers.map((val, j) => (
                                            <td key={j} className="py-3 px-4 text-center">
                                                {val === true ? (
                                                    <Check className="w-5 h-5 text-[var(--color-accent)] mx-auto" />
                                                ) : val === false ? (
                                                    <X className="w-5 h-5 text-[var(--color-text-muted)] opacity-30 mx-auto" />
                                                ) : (
                                                    <span className="text-sm text-[var(--color-text-secondary)]">
                                                        {val}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container text-center">
                    <h2 className="heading-md mb-4">Ready to get started?</h2>
                    <p className="body-lg mb-6 max-w-lg mx-auto">
                        Book a free consultation and we&apos;ll help you pick the right
                        plan.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
