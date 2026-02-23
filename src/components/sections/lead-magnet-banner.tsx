"use client";

import { useState } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";

export function LeadMagnetBanner() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    source: "lead_magnet_banner",
                    page: "/",
                }),
            });
            setSubmitted(true);
        } catch {
            // handle silently
        }
    };

    return (
        <section className="bg-[var(--color-bg-elevated)] border-y border-[var(--color-border-subtle)]">
            <div className="section-container section-padding">
                <FadeIn>
                    <div className="card p-8 md:p-12 text-center max-w-2xl mx-auto border-[var(--color-accent)] border-opacity-30">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-7 h-7 text-[var(--color-accent)]" />
                        </div>

                        {submitted ? (
                            <>
                                <h3 className="heading-md mb-2">You&apos;re In! 🎉</h3>
                                <p className="body-lg">
                                    Check your email for the Mountain Performance Guide. It&apos;s
                                    packed with actionable tips.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="heading-md mb-2">
                                    {siteConfig.leadMagnet.title}
                                </h3>
                                <p className="body-lg mb-6">{siteConfig.leadMagnet.subtitle}</p>

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                                    id="lead-magnet-form"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="input flex-grow"
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary whitespace-nowrap">
                                        {siteConfig.leadMagnet.cta}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>

                                <p className="body-sm mt-3">
                                    Free instant download. No spam, ever.
                                </p>
                            </>
                        )}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
