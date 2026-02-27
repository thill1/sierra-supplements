"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";

/* ── Ember particle config ────────────────────────────────────── */
function generateEmbers(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 30}%`,
        size: `${2 + Math.random() * 4}px`,
        duration: `${5 + Math.random() * 7}s`,
        delay: `${Math.random() * 8}s`,
    }));
}

/* ── Stagger animation variants ───────────────────────────────── */
const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8, delay: 0.6 },
    },
};

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const embers = useMemo(() => generateEmbers(18), []);

    /* Parallax: background moves slower than content */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[100vh] sm:min-h-[100vh] flex flex-col overflow-hidden"
        >
            {/* ── Background with Ken Burns + Parallax ──────────── */}
            <motion.div
                className="absolute inset-0"
                style={{ y: bgY }}
            >
                <div className="absolute inset-0 hero-ken-burns">
                    <Image
                        src="/images/hero-brand.png"
                        alt="Sierra Strength Supplements – Mountain landscape with dramatic sky"
                        fill
                        priority
                        className="object-cover object-center sm:object-cover sm:object-center"
                        sizes="100vw"
                    />
                    {/* Dark fill behind the contained image on mobile */}
                    <div className="absolute inset-0 -z-10 bg-[#0a0a0f]" />
                </div>

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.7) 100%)",
                    }}
                />

                {/* Ember glow at horizon */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)",
                    }}
                />

                {/* ── Fog layers ─────────────────────────────────── */}
                <div className="fog-layer fog-layer--primary" />
                <div className="fog-layer fog-layer--secondary" />

                {/* ── Floating embers ────────────────────────────── */}
                {embers.map((ember) => (
                    <div
                        key={ember.id}
                        className="ember-particle"
                        style={{
                            left: ember.left,
                            bottom: ember.bottom,
                            ["--ember-size" as string]: ember.size,
                            ["--ember-duration" as string]: ember.duration,
                            ["--ember-delay" as string]: ember.delay,
                        }}
                    />
                ))}
            </motion.div>

            {/* ── Content ────────────────────────────────────────── */}
            <motion.div
                className="section-container relative z-10 flex flex-col flex-1 min-h-0 pt-24 text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Spacer — lets the brand image breathe */}
                <div className="flex-1" aria-hidden="true" />

                {/* CTA overlay */}
                <motion.div
                    className="rounded-2xl py-3 px-6 sm:py-4 sm:px-8 mt-auto mb-1 sm:mb-[48px] max-w-2xl mx-auto bg-black/5 border border-[var(--color-accent)]/30 shadow-lg shadow-black/10 cta-ember-pulse transition-all duration-300 hover:border-[var(--color-accent)]/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    variants={fadeUp}
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
                    <p className="label tracking-[0.25em] text-[var(--color-accent)] text-center mt-5">
                        Auburn, CA · Third-Party Tested · Science-Backed
                    </p>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="flex justify-center pb-2"
                    variants={fadeIn}
                >
                    <ChevronDown className="w-6 h-6 text-[var(--color-text-muted)] scroll-hint-arrow" />
                </motion.div>

                {/* Stats bar */}
                <motion.div
                    className="flex flex-wrap justify-center gap-12 pt-6 pb-6 border-t border-white/10"
                    variants={fadeIn}
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
                                    textShadow:
                                        "0 0 20px rgba(245, 158, 11, 0.4)",
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
            </motion.div>
        </section>
    );
}
