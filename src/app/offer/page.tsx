"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, CheckCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function OfferPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
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
                        <Gift className="w-10 h-10 text-[var(--color-accent)]" />
                    </div>
                    <h1 className="heading-lg mb-4">Check Your Inbox! 🎉</h1>
                    <p className="body-lg mb-8">
                        Your Mountain Performance Guide is on its way. While you wait…
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Your Free Consultation <ArrowRight className="w-4 h-4" />
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
                        <Gift className="w-8 h-8 text-[var(--color-accent)]" />
                    </div>
                    <span className="label">Free Download</span>
                    <h1 className="heading-lg mt-2 mb-4">
                        {siteConfig.leadMagnet.title}
                    </h1>
                    <p className="body-lg">{siteConfig.leadMagnet.subtitle}</p>
                </div>

                <div className="card p-8">
                    <ul className="space-y-3 mb-6">
                        {[
                            "The #1 supplement most mountain athletes are missing",
                            "Altitude-specific hydration formula",
                            "Pre and post-workout stacks for endurance",
                            "Recovery protocols from our coaching team",
                            "Nutrition timing strategies for peak performance",
                            "Exclusive discount code for your first order",
                            "Bonus: Our favorite trail snack recipes",
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
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="input"
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full text-base py-4">
                            {siteConfig.leadMagnet.cta}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <p className="body-sm text-center mt-3">
                        No spam. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
