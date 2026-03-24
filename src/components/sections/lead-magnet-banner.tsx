"use client";

import { useState } from "react";
import { ArrowRight, Percent } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";
import {
    EXIT_INTENT_DISCOUNT_CODE,
    EXIT_INTENT_DISCOUNT_PERCENT,
} from "@/lib/promo";

type LeadMagnetCopy = {
    title: string;
    subtitle: string;
    cta: string;
};

export function LeadMagnetBanner({
    leadMagnet,
}: {
    leadMagnet?: LeadMagnetCopy;
}) {
    const copy = leadMagnet ?? siteConfig.leadMagnet;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !name.trim()) return;

        try {
            await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
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
                            <Percent className="w-7 h-7 text-[var(--color-accent)]" />
                        </div>

                        {submitted ? (
                            <>
                                <h3 className="heading-md mb-2">
                                    Here&apos;s your {EXIT_INTENT_DISCOUNT_PERCENT}% off code
                                </h3>
                                <p className="body-lg mb-4">
                                    Use it on your <strong>first order only</strong>—enter at checkout
                                    or mention it when you order.
                                </p>
                                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3 font-mono text-lg font-semibold tracking-wide text-[var(--color-text)] select-all max-w-sm mx-auto">
                                    {EXIT_INTENT_DISCOUNT_CODE}
                                </div>
                                <p className="body-sm mt-4 text-[var(--color-text-muted)]">
                                    We&apos;ve also emailed you a copy so you don&apos;t lose it.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="heading-md mb-2">{copy.title}</h3>
                                <p className="body-lg mb-6">{copy.subtitle}</p>

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-3 max-w-md mx-auto"
                                    id="lead-magnet-form"
                                >
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="input text-center sm:text-left"
                                        name="name"
                                        autoComplete="name"
                                        required
                                    />
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email"
                                            className="input flex-grow text-center sm:text-left"
                                            name="email"
                                            autoComplete="email"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary whitespace-nowrap"
                                        >
                                            {copy.cta}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                <p className="body-sm mt-3">
                                    First order only. One use per customer. No spam, ever.
                                </p>
                            </>
                        )}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
