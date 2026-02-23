"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative min-h-[100vh] flex flex-col overflow-hidden">
            {/* Full-bleed background image */}
            <div className="absolute inset-0">
                <Image
                    src="/images/hero-brand.png"
                    alt="Sierra - Mountain landscape with dramatic sky"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* Light gradient overlay: lets background show through more */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.65) 100%)",
                    }}
                />
                {/* Subtle ember glow at horizon */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)",
                    }}
                />
            </div>

            {/* Content: logo centered, overlay pushed to bottom */}
            <div className="section-container relative z-10 flex flex-col flex-1 min-h-0 pt-24 text-center">
                {/* Label: anchored near top */}
                <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="label tracking-[0.25em] text-[var(--color-accent)]">
                        Auburn, CA · Third-Party Tested · Science-Backed
                    </span>
                </motion.div>

                {/* Spacer for hero background */}
                <div className="flex-1" aria-hidden="true" />

                {/* CTA overlay: anchored to bottom */}
                <motion.div
                    className="rounded-2xl p-6 sm:p-8 mt-auto mb-12 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(18,18,22,0.9) 0%, rgba(12,15,18,0.95) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow:
                            "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1)",
                    }}
                >
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <Link
                            href="/store"
                            className="btn btn-primary hero-ember-glow text-base px-8 py-4 flex items-center gap-2"
                            id="hero-cta-store"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Shop Supplements
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/book"
                            className="btn btn-secondary text-base px-6 py-4 border-[var(--color-accent)]/50 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
                            id="hero-cta-book"
                        >
                            Free Consultation
                        </Link>
                        <Link
                            href="/services"
                            className="btn-ghost text-base px-6 py-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                            id="hero-cta-services"
                        >
                            Services
                        </Link>
                    </div>
                </motion.div>

                {/* Stats bar */}
                <motion.div
                    className="flex flex-wrap justify-center gap-12 pt-8 pb-6 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {[
                        { value: "50+", label: "Premium Products" },
                        { value: "4.9★", label: "Google Rating" },
                        { value: "100%", label: "Third-Party Tested" },
                        { value: "500+", label: "Clients Served" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div
                                className="text-2xl font-bold text-[var(--color-accent)]"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    textShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
                                }}
                            >
                                {stat.value}
                            </div>
                            <div className="body-sm text-[var(--color-text-muted)]">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
