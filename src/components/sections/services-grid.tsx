import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Wider twin-peak silhouette; base spans nearly full width for a broader mountain.
 */
const MOUNTAIN_SHELL =
    "[clip-path:polygon(28%_5%,50%_40%,74%_18%,97.5%_100%,2.5%_100%)]";

const band =
    "group relative flex w-full flex-1 flex-col items-center justify-center gap-2 text-balance text-center outline-none px-5 py-5 sm:px-10 sm:py-6 md:px-12 md:py-7 min-h-[11rem] sm:min-h-[12rem] md:min-h-[13rem] transition-[filter] duration-300 hover:brightness-[1.06] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-snow)]/40";

const textBlock = "w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-2";

/**
 * One wide mountain; three clearly separated levels (summit / alpine / base).
 * Colors: burnt orange (peak), cool slate (middle), forest green (base only).
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
                    className={`mx-auto w-full max-w-4xl lg:max-w-5xl min-h-[36rem] sm:min-h-[40rem] md:min-h-[44rem] h-[min(118vw,44rem)] sm:h-[42rem] md:h-[46rem] lg:h-[48rem] border border-[var(--color-border)]/90 shadow-[0_28px_64px_rgba(0,0,0,0.55)] overflow-hidden ${MOUNTAIN_SHELL}`}
                    aria-label="Service mountain: three levels in one peak"
                >
                    <div className="flex h-full min-h-0 flex-col">
                        {/* Summit — Peak Protocols (burnt orange / copper) */}
                        <Link
                            href={`/services/${peak.slug}`}
                            className={`${band} shrink-0 border-b-2 border-[#431407]/80 bg-gradient-to-b from-[#7c2d12] via-[var(--color-accent)] to-[#c2410c]`}
                            aria-label={`${peak.title}: ${peak.shortDescription}`}
                        >
                            <div className={textBlock}>
                                <span className="font-[family-name:var(--font-outfit)] text-base sm:text-lg md:text-xl font-semibold tracking-tight text-[var(--color-snow)] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                                    {peak.title}
                                </span>
                                <span className="block text-sm sm:text-base leading-relaxed text-[var(--color-snow)] drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
                                    {peak.shortDescription}
                                </span>
                            </div>
                        </Link>

                        {/* Alpine — High Elevation Coaching (cool slate / altitude — not green) */}
                        <Link
                            href={`/services/${coaching.slug}`}
                            className={`${band} shrink-0 border-b-2 border-[#0f172a]/90 bg-gradient-to-b from-[#0f172a] via-[#1e3a5f] to-[#334155]`}
                            aria-label={`${coaching.title}: ${coaching.shortDescription}`}
                        >
                            <div className={textBlock}>
                                <span className="font-[family-name:var(--font-outfit)] text-base sm:text-lg md:text-xl font-semibold tracking-tight text-[var(--color-snow)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                                    {coaching.title}
                                </span>
                                <span className="block text-sm sm:text-base leading-relaxed text-[var(--color-snow)]/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                                    {coaching.shortDescription}
                                </span>
                            </div>
                        </Link>

                        {/* Base — Base Camp Nutrition (forest green only on this level) */}
                        <Link
                            href={`/services/${base.slug}`}
                            className={`${band} shrink-0 bg-gradient-to-b from-[#0a1f14] via-[var(--color-pine)] to-[#3d6b4f]`}
                            aria-label={`${base.title}: ${base.shortDescription}`}
                        >
                            <div className={textBlock}>
                                <span className="font-[family-name:var(--font-outfit)] text-base sm:text-lg md:text-xl font-semibold tracking-tight text-[var(--color-snow)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                                    {base.title}
                                </span>
                                <span className="block text-sm sm:text-base leading-relaxed text-[var(--color-snow)]/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.88)]">
                                    {base.shortDescription}
                                </span>
                            </div>
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
