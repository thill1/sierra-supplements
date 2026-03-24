import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Twin-peak silhouette (same geometry family as src/app/icon.svg), as % for clip-path. */
const MOUNTAIN_CLIP =
    "[clip-path:polygon(33%_6%,50%_38%,66%_22%,88%_96%,12%_96%)]";

const tierInteractive =
    "group relative flex flex-col justify-end text-center outline-none transition-[filter,transform,box-shadow] duration-300 hover:brightness-110 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]";

/**
 * Three stacked mountain layers (Lucide-style offset stack) — same content as before.
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
            data-pyramid-layout="layered-mountain"
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

                {/* Layered mountains: Lucide-style diagonal offset; DOM order = summit → ridge → base for focus. */}
                <nav
                    className="relative mx-auto max-w-lg md:max-w-2xl h-[min(78vw,28rem)] sm:h-[min(72vw,32rem)] md:h-[34rem]"
                    aria-label="Service mountain: three stacked layers"
                >
                    {/* Front layer — summit (drawn on top via z-index) */}
                    <Link
                        href={`/services/${peak.slug}`}
                        className={`${tierInteractive} absolute z-[3] bottom-[24%] left-[16%] sm:left-[20%] w-[min(78%,22rem)] sm:w-[68%] h-[52%] ${MOUNTAIN_CLIP} border border-[var(--color-border-subtle)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] bg-gradient-to-b from-[#7c2d12] via-[var(--color-accent)] to-[#fbbf24]`}
                        aria-label={`${peak.title}: ${peak.shortDescription}`}
                    >
                        <div className="relative z-10 px-4 pb-4 pt-[min(34%,7rem)] md:pt-[32%]">
                            <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                                {peak.title}
                            </span>
                            <span className="mt-1.5 block text-xs md:text-sm text-[var(--color-snow)]/95 leading-snug max-w-[15rem] mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                                {peak.shortDescription}
                            </span>
                        </div>
                    </Link>

                    <Link
                        href={`/services/${coaching.slug}`}
                        className={`${tierInteractive} absolute z-[2] bottom-[12%] left-[8%] sm:left-[10%] w-[min(92%,26rem)] sm:w-[84%] h-[58%] ${MOUNTAIN_CLIP} border border-[var(--color-border)]/70 shadow-[0_14px_36px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[#1a3324] via-[var(--color-pine)] to-[#3d6b4f]`}
                        aria-label={`${coaching.title}: ${coaching.shortDescription}`}
                    >
                        <div className="relative z-10 px-5 pb-4 pt-[min(38%,8rem)] md:pt-[36%]">
                            <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                                {coaching.title}
                            </span>
                            <span className="mt-1.5 block text-xs md:text-sm text-[var(--color-snow)]/92 leading-snug max-w-[18rem] mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                                {coaching.shortDescription}
                            </span>
                        </div>
                    </Link>

                    {/* Back layer — widest (base camp) */}
                    <Link
                        href={`/services/${base.slug}`}
                        className={`${tierInteractive} absolute z-[1] bottom-0 left-0 w-[min(100%,28rem)] md:w-full h-[62%] ${MOUNTAIN_CLIP} border border-[var(--color-border)]/80 shadow-[0_18px_40px_rgba(0,0,0,0.45)] bg-gradient-to-b from-[#0f2418] via-[var(--color-pine)] to-[#1a3d28]`}
                        aria-label={`${base.title}: ${base.shortDescription}`}
                    >
                        <div className="relative z-10 px-5 pb-5 pt-[min(42%,9rem)] md:pt-[40%]">
                            <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                                {base.title}
                            </span>
                            <span className="mt-1.5 block text-xs md:text-sm text-[var(--color-snow)]/92 leading-snug max-w-[20rem] mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                                {base.shortDescription}
                            </span>
                        </div>
                    </Link>
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
