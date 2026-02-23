"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mountain, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { CartIcon } from "./cart-icon";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="section-container">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Mountain
                            className="w-7 h-7 text-[var(--color-accent)] transition-transform group-hover:scale-110"
                            strokeWidth={2.5}
                        />
                        <span
                            className="text-lg font-bold tracking-tight"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {siteConfig.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {siteConfig.nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="btn-ghost text-sm"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <CartIcon />
                        <Link
                            href="/book"
                            className="btn btn-primary ml-3 text-sm py-2 px-4"
                        >
                            Book Now
                        </Link>
                    </nav>

                    {/* Mobile: Cart + Phone + Menu */}
                    <div className="flex items-center gap-2 md:hidden">
                        <CartIcon />
                        <a
                            href={`tel:${siteConfig.phone}`}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                            aria-label="Call us"
                        >
                            <Phone className="w-5 h-5 text-[var(--color-accent)]" />
                        </a>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden glass border-t border-[var(--color-border-subtle)]"
                    >
                        <nav className="section-container py-4 flex flex-col gap-1">
                            {siteConfig.nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="py-3 px-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors text-base"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href="/store/cart"
                                onClick={() => setIsOpen(false)}
                                className="py-3 px-4 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors text-base flex items-center gap-2"
                            >
                                <span>Cart</span>
                            </Link>
                            <Link
                                href="/book"
                                onClick={() => setIsOpen(false)}
                                className="btn btn-primary mt-2"
                            >
                                Book Now
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
