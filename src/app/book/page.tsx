import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { CalEmbed } from "@/components/booking/cal-embed";

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

                {/* Cal.com embed */}
                <div className="max-w-4xl mx-auto">
                    <div className="card !p-0 overflow-hidden min-h-[600px] border-[var(--color-accent)]/20 shadow-xl shadow-[var(--color-accent)]/5">
                        <div className="w-full h-full min-h-[600px]">
                            <CalEmbed />
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
            </section>
        </div>
    );
}
