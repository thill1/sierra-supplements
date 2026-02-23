import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book a Consultation",
    description: `Schedule a free consultation with ${siteConfig.name}. We'll help you find the perfect supplement plan.`,
};

export default function BookPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="text-center mb-12">
                    <span className="label">Book Now</span>
                    <h1 className="heading-xl mt-2 mb-4">
                        Schedule Your{" "}
                        <span className="gradient-text">Free Consultation</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        Pick a time that works for you. We&apos;ll discuss your goals, answer
                        questions, and create a plan — no pressure, no obligation.
                    </p>
                </div>

                {/* Cal.com embed placeholder */}
                <div className="max-w-3xl mx-auto">
                    <div className="card p-8 md:p-12">
                        <div className="min-h-[500px] bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center p-8 text-center">
                            {/* This would be replaced with the actual Cal.com embed */}
                            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mb-6">
                                <span className="text-2xl">📅</span>
                            </div>
                            <h3 className="heading-sm mb-3">Calendar Booking</h3>
                            <p className="body-sm mb-6 max-w-md">
                                Cal.com embed will load here. Configure your Cal.com link in{" "}
                                <code className="text-[var(--color-accent)] bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded text-xs">
                                    site-config.ts
                                </code>
                            </p>
                            <p className="body-sm mb-6">
                                Cal link:{" "}
                                <code className="text-[var(--color-accent)]">
                                    {siteConfig.calLink}
                                </code>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={`https://cal.com/${siteConfig.calLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    Open Calendar <ArrowRight className="w-4 h-4" />
                                </a>
                                <a
                                    href={`tel:${siteConfig.phone}`}
                                    className="btn btn-secondary"
                                >
                                    Or Call Us: {siteConfig.phone}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Support info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="card text-center py-6">
                            <div className="text-2xl mb-2">⏱️</div>
                            <h4 className="font-semibold text-sm">15-Minute Call</h4>
                            <p className="body-sm">No commitment required</p>
                        </div>
                        <div className="card text-center py-6">
                            <div className="text-2xl mb-2">🎯</div>
                            <h4 className="font-semibold text-sm">Custom Plan</h4>
                            <p className="body-sm">Tailored to your goals</p>
                        </div>
                        <div className="card text-center py-6">
                            <div className="text-2xl mb-2">💰</div>
                            <h4 className="font-semibold text-sm">100% Free</h4>
                            <p className="body-sm">No obligation, no upsell</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
