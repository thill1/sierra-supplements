import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Server-rendered so the pyramid is always in the initial HTML (no client-only motion). */
export function ServicesGrid() {
    const peak = siteConfig.services.find((s) => s.slug === "sierra-stack-systems");
    const coaching = siteConfig.services.find((s) => s.slug === "high-elevation-coaching");
    const base = siteConfig.services.find((s) => s.slug === "ascent-nutrition");

    if (!peak || !coaching || !base) {
        return null;
    }

    return (
        <section className="section-padding" id="services" data-home-services="pyramid">
            <div className="section-container">
                <div className="text-center mb-10 md:mb-14 motion-safe:animate-[fade-in-up_0.6s_ease-out_both]">
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

                <div className="max-w-lg md:max-w-xl mx-auto motion-safe:animate-[fade-in-up_0.6s_ease-out_0.08s_both]">
                    <div className="relative w-full min-h-[280px] sm:min-h-[320px] aspect-[400/400] md:aspect-[400/380]">
                        <svg
                            className="absolute inset-0 h-full w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                            viewBox="0 0 400 400"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-labelledby="pyramid-svg-title"
                        >
                            <title id="pyramid-svg-title">Service pyramid</title>
                            <defs>
                                <linearGradient
                                    id="pyramid-base-fill"
                                    x1="200"
                                    y1="230"
                                    x2="200"
                                    y2="400"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#1a3d28" />
                                    <stop offset="1" stopColor="var(--color-pine)" />
                                </linearGradient>
                                <linearGradient
                                    id="pyramid-mid-fill"
                                    x1="200"
                                    y1="130"
                                    x2="200"
                                    y2="230"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="var(--color-pine)" />
                                    <stop offset="1" stopColor="#3d6b4f" />
                                </linearGradient>
                                <linearGradient
                                    id="pyramid-peak-fill"
                                    x1="200"
                                    y1="24"
                                    x2="200"
                                    y2="130"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#b45309" />
                                    <stop offset="0.55" stopColor="var(--color-accent)" />
                                    <stop offset="1" stopColor="#fbbf24" />
                                </linearGradient>
                            </defs>

                            <a
                                href={`/services/${base.slug}`}
                                className="group outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-sm"
                                aria-label={`${base.title}: ${base.shortDescription}`}
                            >
                                <polygon
                                    points="0,400 400,400 375,230 25,230"
                                    fill="url(#pyramid-base-fill)"
                                    stroke="var(--color-border)"
                                    strokeWidth="1.5"
                                    className="transition-[filter] duration-300 group-hover:brightness-110 group-focus-visible:brightness-110"
                                />
                            </a>
                            <a
                                href={`/services/${coaching.slug}`}
                                className="group outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-sm"
                                aria-label={`${coaching.title}: ${coaching.shortDescription}`}
                            >
                                <polygon
                                    points="25,230 375,230 335,130 65,130"
                                    fill="url(#pyramid-mid-fill)"
                                    stroke="var(--color-border)"
                                    strokeWidth="1.5"
                                    className="transition-[filter] duration-300 group-hover:brightness-110 group-focus-visible:brightness-110"
                                />
                            </a>
                            <a
                                href={`/services/${peak.slug}`}
                                className="group outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-sm"
                                aria-label={`${peak.title}: ${peak.shortDescription}`}
                            >
                                <polygon
                                    points="65,130 335,130 288,58 200,24 112,58"
                                    fill="url(#pyramid-peak-fill)"
                                    stroke="var(--color-border-subtle)"
                                    strokeWidth="1.5"
                                    className="transition-[filter] duration-300 group-hover:brightness-110 group-focus-visible:brightness-110"
                                />
                            </a>
                        </svg>

                        <div className="absolute inset-0 flex flex-col pointer-events-none text-center">
                            <div className="flex-[0.28] flex flex-col items-center justify-center px-10 md:px-14 pt-2">
                                <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                                    {peak.title}
                                </span>
                                <span className="mt-1 text-xs md:text-sm text-[var(--color-snow)]/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] line-clamp-2 max-w-[16rem] md:max-w-none leading-snug">
                                    {peak.shortDescription}
                                </span>
                            </div>
                            <div className="flex-[0.24] flex flex-col items-center justify-center px-9 md:px-12">
                                <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]">
                                    {coaching.title}
                                </span>
                                <span className="mt-1 text-xs md:text-sm text-[var(--color-snow)]/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] line-clamp-2 max-w-[17rem] md:max-w-none leading-snug">
                                    {coaching.shortDescription}
                                </span>
                            </div>
                            <div className="flex-[0.48] flex flex-col items-center justify-center px-8 md:px-10 pb-2">
                                <span className="font-[family-name:var(--font-outfit)] text-sm md:text-base font-semibold text-[var(--color-snow)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                                    {base.title}
                                </span>
                                <span className="mt-1 text-xs md:text-sm text-[var(--color-snow)]/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] line-clamp-2 max-w-[18rem] md:max-w-none leading-snug">
                                    {base.shortDescription}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
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
            </div>
        </section>
    );
}
