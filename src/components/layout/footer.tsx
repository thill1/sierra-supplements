import Link from "next/link";
import { Mountain, Instagram, Facebook, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--color-border-subtle)] pb-24 md:pb-0">
            {/* CTA Band */}
            <div className="bg-[var(--color-accent)] py-12">
                <div className="section-container text-center">
                    <h2
                        className="heading-md text-[var(--color-bg)] mb-3"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Ready to Reach Your Peak?
                    </h2>
                    <p className="text-[var(--color-bg)] opacity-80 mb-6 max-w-md mx-auto">
                        Book a free consultation and discover your custom supplement plan.
                    </p>
                    <Link
                        href="/book"
                        className="btn bg-[var(--color-bg)] text-[var(--color-accent)] hover:bg-[var(--color-bg-elevated)] font-bold"
                    >
                        Book Free Consultation
                    </Link>
                </div>
            </div>

            {/* Main Footer */}
            <div className="section-container section-padding">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Mountain className="w-6 h-6 text-[var(--color-accent)]" />
                            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="body-sm mb-4">{siteConfig.description}</p>
                        <div className="flex gap-3">
                            <a
                                href={siteConfig.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href={siteConfig.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href={siteConfig.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                aria-label="YouTube"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Quick Links</h3>
                        <ul className="space-y-2">
                            {siteConfig.nav.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="body-sm hover:text-[var(--color-accent)] transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/book" className="body-sm hover:text-[var(--color-accent)] transition-colors">
                                    Book Now
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Services</h3>
                        <ul className="space-y-2">
                            {siteConfig.services.slice(0, 5).map((s) => (
                                <li key={s.slug}>
                                    <Link
                                        href={`/services/${s.slug}`}
                                        className="body-sm hover:text-[var(--color-accent)] transition-colors"
                                    >
                                        {s.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href={`tel:${siteConfig.phone}`}
                                    className="body-sm hover:text-[var(--color-accent)] transition-colors"
                                >
                                    {siteConfig.phone}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${siteConfig.email}`}
                                    className="body-sm hover:text-[var(--color-accent)] transition-colors"
                                >
                                    {siteConfig.email}
                                </a>
                            </li>
                            <li>
                                <p className="body-sm">{siteConfig.address.full}</p>
                            </li>
                            {siteConfig.hours.map((h) => (
                                <li key={h.day} className="body-sm">
                                    <span className="text-[var(--color-text-secondary)]">{h.day}:</span>{" "}
                                    {h.time}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-6 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="body-sm">
                        © {currentYear} {siteConfig.name}. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="body-sm hover:text-[var(--color-accent)] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="body-sm hover:text-[var(--color-accent)] transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
