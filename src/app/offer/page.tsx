"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Percent, CheckCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import {
    EXIT_INTENT_DISCOUNT_CODE,
    EXIT_INTENT_DISCOUNT_PERCENT,
} from "@/lib/promo";

export default function OfferPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
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
                    source: "lead_magnet_page",
                    page: "/offer",
                }),
            });
            setSubmitted(true);
        } catch {
            // handle silently
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-6">
                        <Percent className="w-10 h-10 text-[var(--color-accent)]" />
                    </div>
                    <h1 className="heading-lg mb-4">
                        Here&apos;s your {EXIT_INTENT_DISCOUNT_PERCENT}% off code
                    </h1>
                    <p className="body-lg mb-4">
                        Use <strong>{EXIT_INTENT_DISCOUNT_CODE}</strong> on your{" "}
                        <strong>first order only</strong>—at checkout or when you order. One use per
                        customer.
                    </p>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3 font-mono text-lg font-semibold tracking-wide select-all mb-8">
                        {EXIT_INTENT_DISCOUNT_CODE}
                    </div>
                    <Link href="/store" className="btn btn-primary">
                        Shop the store <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                        <Percent className="w-8 h-8 text-[var(--color-accent)]" />
                    </div>
                    <span className="label">First-order savings</span>
                    <h1 className="heading-lg mt-2 mb-4">{siteConfig.leadMagnet.title}</h1>
                    <p className="body-lg">{siteConfig.leadMagnet.subtitle}</p>
                </div>

                <div className="card p-8">
                    <ul className="space-y-3 mb-6">
                        {[
                            `${EXIT_INTENT_DISCOUNT_PERCENT}% off your first purchase when you apply the code`,
                            "Valid once per customer—enter at checkout or mention when you order",
                            "Same code you will see after you submit: easy to copy and save",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleSubmit} className="space-y-4" id="offer-form">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your first name"
                            className="input"
                            name="name"
                            autoComplete="name"
                            required
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="input"
                            name="email"
                            autoComplete="email"
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full text-base py-4">
                            {siteConfig.leadMagnet.cta}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <p className="body-sm text-center mt-3">
                        First order only. No spam. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
