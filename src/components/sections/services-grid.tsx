import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Section narrative — production copy (service titles/descriptions come from siteConfig). */
const SERVICES_INTRO =
    "From base camp to the summit, each tier builds on the last: nutrition as your foundation, coaching on the climb, and personalized protocols at the peak. Explore where you want to start—or stack every level for the full ascent.";

/**
 * Twin peaks + distant range — matches design-mocks/peak-services-horizon-hero-mock.html:
 * full-card silhouette layer, SVG 105% height, min 320px, xMidYMax slice so peaks scale large.
 */
function ServiceMountains() {
    return (
        <div className="pointer-events-none absolute inset-0 z-[1] min-h-[280px]" aria-hidden>
            <svg
                className="block h-[105%] w-full min-h-[320px] translate-y-[2%]"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMax slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="servicesPeakMassMain" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#2a4d3a" />
                        <stop offset="28%" stopColor="#1a3024" />
                        <stop offset="62%" stopColor="#0c1610" />
                        <stop offset="100%" stopColor="#030605" />
                    </linearGradient>
                    <linearGradient id="servicesPeakMassBack" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#1f3d2e" />
                        <stop offset="100%" stopColor="#050807" />
                    </linearGradient>
                </defs>
                <path
                    className="opacity-[0.45]"
                    fill="url(#servicesPeakMassBack)"
                    d="M0 300 L0 210 L45 175 L95 195 L155 155 L220 175 L290 140 L360 165 L400 145 L400 300 Z"
                />
                <path
                    className="opacity-[0.55] drop-shadow-[0_-2px_24px_rgba(0,0,0,0.45)]"
                    fill="url(#servicesPeakMassMain)"
                    d="M0 300 L0 188 L78 98 L128 128 L200 32 L272 82 L322 48 L400 148 L400 300 Z"
                />
                <path
                    className="opacity-[0.55]"
                    fill="none"
                    stroke="#9aae94"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    vectorEffect="nonScalingStroke"
                    d="M0 210 L45 175 L95 195 L155 155 L220 175 L290 140 L360 165 L400 145"
                />
                <path
                    className="opacity-[0.92]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.75}
                    vectorEffect="nonScalingStroke"
                    d="M0 188 L78 98 L128 128 L200 32 L272 82 L322 48 L400 148"
                    style={{
                        stroke: "color-mix(in srgb, var(--color-accent) 72%, #fde68a)",
                        filter:
                            "drop-shadow(0 0 10px color-mix(in srgb, var(--color-accent) 55%, transparent)) drop-shadow(0 -1px 18px color-mix(in srgb, var(--color-accent-hover) 35%, transparent))",
                    }}
                />
            </svg>
        </div>
    );
}

/**
 * Horizon hero — large full-bleed mountain art (mock HTML + PNG); text sits above peaks via padding.
 */
export function ServicesGrid() {
    const peak = siteConfig.services.find((s) => s.slug === "sierra-stack-systems");
    const coaching = siteConfig.services.find((s) => s.slug === "high-elevation-coaching");
    const base = siteConfig.services.find((s) => s.slug === "ascent-nutrition");

    if (!peak || !coaching || !base) {
        return null;
    }

    const tiers = [peak, coaching, base] as const;

    return (
        <section
            className="section-padding"
            id="services"
            data-home-services="horizon-hero"
        >
            <div className="section-container">
                <div className="text-center mb-10 md:mb-14">
                    <span className="label">What We Offer</span>
                    <h2 className="heading-lg mt-2 mb-4">
                        Peak Performance <span className="gradient-text">Services</span>
                    </h2>
                    <p className="body-lg max-w-3xl mx-auto text-pretty">{SERVICES_INTRO}</p>
                </div>

                <nav
                    className="relative isolate flex min-h-[28rem] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] shadow-[0_28px_72px_rgba(0,0,0,0.55)] sm:min-h-[30rem] md:min-h-[34rem] md:rounded-[var(--radius-2xl)] lg:min-h-[38rem]"
                    aria-label="Service tiers: Peak Protocols, High Elevation Coaching, Base Camp Nutrition"
                >
                    {/* Background — warm top-center bloom like PNG; edges fall to deep green/black */}
                    <div className="absolute inset-0 z-0 bg-[var(--color-bg)]" aria-hidden />
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `
                radial-gradient(ellipse 85% 55% at 50% 8%, rgba(217, 119, 6, 0.22) 0%, transparent 55%),
                radial-gradient(ellipse 70% 45% at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 45%),
                radial-gradient(ellipse 90% 60% at 12% 100%, rgba(45, 90, 61, 0.35) 0%, transparent 50%),
                radial-gradient(ellipse 85% 55% at 92% 100%, rgba(26, 46, 34, 0.45) 0%, transparent 48%),
                linear-gradient(180deg, #152018 0%, #0f1612 35%, #0a0e0c 100%)
              `,
                        }}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute left-1/2 top-[-8%] z-[1] h-[52%] w-[min(95%,560px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.18)_0%,rgba(217,119,6,0.06)_35%,transparent_68%)]"
                        aria-hidden
                    />
                    <ServiceMountains />
                    <div
                        className="absolute inset-0 z-[2] opacity-[0.025] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
                        aria-hidden
                    />

                    {/* Content: centered columns like PNG; horizon ~upper third of card */}
                    <div className="relative z-[3] flex min-h-0 flex-1 flex-col px-6 pt-8 pb-48 sm:px-10 sm:pt-10 sm:pb-52 md:px-12 md:pt-11 md:pb-56 lg:px-14 lg:pt-12 lg:pb-60">
                        <div
                            className="mb-8 h-px w-full max-w-none bg-gradient-to-r from-transparent via-[var(--color-accent)]/35 to-transparent sm:mb-10 md:mb-12"
                            aria-hidden
                        />

                        <div className="grid flex-1 grid-cols-1 content-start gap-14 md:grid-cols-3 md:gap-6 lg:gap-10">
                            {tiers.map((tier, index) => (
                                <Link
                                    key={tier.slug}
                                    href={`/services/${tier.slug}`}
                                    className="group relative flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-xl px-3 py-2 -mx-3 transition-colors hover:bg-[color-mix(in_srgb,var(--color-snow)_5%,transparent)]"
                                    aria-label={`${tier.title}. ${tier.shortDescription}`}
                                >
                                    {index > 0 ? (
                                        <span
                                            className="mx-auto mb-8 block h-px w-14 bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent md:hidden"
                                            aria-hidden
                                        />
                                    ) : null}
                                    <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold tracking-tight text-[var(--color-text)] sm:text-xl">
                                        {tier.title}
                                    </h3>
                                    <p className="mt-4 max-w-[22rem] text-pretty text-sm leading-relaxed text-[var(--color-text-secondary)]">
                                        {tier.shortDescription}
                                    </p>
                                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
                                        Explore
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                <p className="text-center text-sm text-[var(--color-text-muted)] mt-10 md:mt-12">
                    Want the full picture?{" "}
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
