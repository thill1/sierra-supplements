"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Percent } from "lucide-react";
import {
    EXIT_INTENT_DISCOUNT_CODE,
    EXIT_INTENT_DISCOUNT_PERCENT,
} from "@/lib/promo";

export function ExitIntentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const handleMouseLeave = useCallback(
        (e: MouseEvent) => {
            if (
                e.clientY <= 0 &&
                !dismissed &&
                !sessionStorage.getItem("exitModalShown")
            ) {
                setIsOpen(true);
                sessionStorage.setItem("exitModalShown", "true");
            }
        },
        [dismissed]
    );

    useEffect(() => {
        // Desktop: exit intent
        document.addEventListener("mouseleave", handleMouseLeave);

        // Mobile: scroll-triggered after 60% scroll
        let scrollTimeout: ReturnType<typeof setTimeout>;
        const handleScroll = () => {
            const scrollPercent =
                window.scrollY / (document.body.scrollHeight - window.innerHeight);
            if (
                scrollPercent > 0.6 &&
                !dismissed &&
                !sessionStorage.getItem("exitModalShown")
            ) {
                scrollTimeout = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem("exitModalShown", "true");
                }, 500);
            }
        };

        if (window.innerWidth < 768) {
            window.addEventListener("scroll", handleScroll, { passive: true });
        }

        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [dismissed, handleMouseLeave]);

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
                    source: "exit_intent",
                    page: typeof window !== "undefined" ? window.location.pathname : "/",
                }),
            });
            setSubmitted(true);
        } catch {
            // Silently handle
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="fixed z-50 inset-0 flex items-center justify-center p-4"
                    >
                        <div className="card max-w-md w-full relative p-8 text-center">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                            </button>

                            {submitted ? (
                                <div className="py-4">
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                                        <Percent className="w-7 h-7 text-[var(--color-accent)]" />
                                    </div>
                                    <h3 className="heading-sm mb-2">
                                        Here&apos;s your {EXIT_INTENT_DISCOUNT_PERCENT}% off code
                                    </h3>
                                    <p className="body-sm mb-4">
                                        Use it on your <strong>first order only</strong>—enter at
                                        checkout or mention it when you order to save{" "}
                                        {EXIT_INTENT_DISCOUNT_PERCENT}% on that purchase.
                                    </p>
                                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-4 py-3 font-mono text-lg font-semibold tracking-wide text-[var(--color-text)] select-all">
                                        {EXIT_INTENT_DISCOUNT_CODE}
                                    </div>
                                    <p className="body-sm mt-4 text-[var(--color-text-muted)]">
                                        We&apos;ve also emailed you a copy so you don&apos;t lose it.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                                        <Percent className="w-7 h-7 text-[var(--color-accent)]" />
                                    </div>
                                    <p className="label mb-2">Wait — Before You Go</p>
                                    <h3 className="heading-sm mb-2">
                                        Get {EXIT_INTENT_DISCOUNT_PERCENT}% off your first order
                                    </h3>
                                    <p className="body-sm mb-6">
                                        Share your name and email and we&apos;ll show your exclusive
                                        first-order discount code instantly.
                                    </p>

                                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="input text-center"
                                            name="name"
                                            autoComplete="name"
                                            required
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email"
                                            className="input text-center"
                                            name="email"
                                            autoComplete="email"
                                            required
                                        />
                                        <button type="submit" className="btn btn-primary w-full">
                                            Reveal my code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="body-sm hover:text-[var(--color-text)] transition-colors"
                                        >
                                            No thanks, I&apos;m good
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
