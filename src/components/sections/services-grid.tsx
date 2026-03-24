import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Single mountain silhouette (twin-peak, icon.svg family). One clip on the outer shell only.
 */
const MOUNTAIN_SHELL =
    "[clip-path:polygon(33.3%_10%,50%_48%,70.8%_26%,91.7%_100%,8.3%_100%)]";

const band =
    "group relative flex flex-col items-center justify-center text-center outline-none px-4 py-4 sm:px-8 sm:py-5 md:py-6 transition-[filter] duration-300 hover:brightness-110 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]";

/**
 * One large mountain; three horizontal levels inside (summit → treeline → base).
 * Server-rendered.
 */
export function ServicesGrid() {
    const peak = siteConfig.services.find((s) => s.slug === "sierra-stack-systems");
    const coaching = siteConfig.services.find((s) => s.slug === "high-elevation-coaching");
    const base = siteConfig.services.find((s) => s.slug === "ascent-nutrition");

    if (!peak || !coaching || !base) {
        return null;
    }

    return (
        <section
            className="section-padding"
            id="services"
            data-home-services="pyramid"
            data-pyramid-layout="single-mountain-levels"
        >
            <div className="section-container">
                <div className="text-center mb-10 md:mb-14">
                    <span className="label">What We Offer</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Peak Performance <span className="gradient-text">Services</span>
                    </h2>
                    <p className="body-lg max-w-2xl mx-auto">
                        Your path to the summit is layered: a strong nutritional base, coaching
                        as you climb, and precision protocols at the peak. Each tier builds on the
                        one below—select a level to learn more.
                    </p>
                </div>

                <nav
                    className={`mx-auto w-full max-w-2xl md:max-w-3xl min-h-[min(85vw,22rem)] h-[min(92vw,36rem)] sm:h-[34rem] md:h-[38rem] border border-[var(--color-border)]/90 shadow-[0_24px_56px_rgba(0,0,0,0.5)] overflow-hidden ${MOUNTAIN_SHELL}`}
                    aria-label="Service mountain: three levels in one peak"
                >
                    <div className="flex h-full min-h-0 flex-col">
                        {/* Summit — Peak Protocols */}
                        <Link
                            href={`/services/${peak.slug}`}
                            className={`${band} min-h-0 flex-[0.28] border-b border-[var(--color-border)]/50 bg-gradient-to-b from-[#5c1d0d] via-[var(--color-accent)] to-[#b45309]`}
                            aria-label={`${peak.title}: ${peak.shortDescription}`}
                        >
                            <span className="font-[family-name:var(--font-outfit)] text-base md:text-lg font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                                {peak.title}
                            </span>
                            <span className="mt-2 block max-w-md text-sm md:text-[0.95rem] leading-snug text-[var(--color-snow)]/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                                {peak.shortDescription}
                            </span>
                        </Link>

                        {/* Treeline — High Elevation Coaching */}
                        <Link
                            href={`/services/${coaching.slug}`}
                            className={`${band} min-h-0 flex-[0.34] border-b border-[var(--color-border)]/50 bg-gradient-to-b from-[#1e3d2a] via-[var(--color-pine)] to-[#2f5c40]`}
                            aria-label={`${coaching.title}: ${coaching.shortDescription}`}
                        >
                            <span className="font-[family-name:var(--font-outfit)] text-base md:text-lg font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                                {coaching.title}
                            </span>
                            <span className="mt-2 block max-w-md text-sm md:text-[0.95rem] leading-snug text-[var(--color-snow)]/93 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                                {coaching.shortDescription}
                            </span>
                        </Link>

                        {/* Base — Base Camp Nutrition */}
                        <Link
                            href={`/services/${base.slug}`}
                            className={`${band} min-h-0 flex-[0.38] bg-gradient-to-b from-[#0f2418] via-[#1a3324] to-[var(--color-pine)]`}
                            aria-label={`${base.title}: ${base.shortDescription}`}
                        >
                            <span className="font-[family-name:var(--font-outfit)] text-base md:text-lg font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                {base.title}
                            </span>
                            <span className="mt-2 block max-w-md text-sm md:text-[0.95rem] leading-snug text-[var(--color-snow)]/93 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                                {base.shortDescription}
                            </span>
                        </Link>
                    </div>
                </nav>

                <p className="text-center text-sm text-[var(--color-text-muted)] mt-10 md:mt-12">
                    Prefer the full list?{" "}
                    <Link
                        href="/services"
                        className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] inline-flex items-center gap-1 font-medium"
                    >
                        View all services
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                </p>
            </div>
        </section>
    );
}
