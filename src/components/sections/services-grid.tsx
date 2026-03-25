import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Section narrative — production copy (service titles/descriptions come from siteConfig). */
const SERVICES_INTRO =
    "From base camp to the summit, each tier builds on the last: nutrition as your foundation, coaching on the climb, and personalized protocols at the peak. Explore where you want to start—or stack every level for the full ascent.";

/**
 * Twin peaks + distant range — matches design-mocks/peak-services-horizon-hero-mock.html
 * and public/previews/horizon-hero-services-preview.png (low-poly mass + rim-lit skyline).
 */
function ServiceMountains() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-[1] min-h-[320px]"
            aria-hidden
        >
            <svg
                className="block h-[105%] w-full min-h-[280px] translate-y-[2%]"
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
                {/* Distant range */}
                <path
                    className="opacity-[0.45]"
                    fill="url(#servicesPeakMassBack)"
                    d="M0 300 L0 210 L45 175 L95 195 L155 155 L220 175 L290 140 L360 165 L400 145 L400 300 Z"
                />
                {/* Foreground twin peaks */}
                <path
                    className="opacity-[0.55] drop-shadow-[0_-2px_24px_rgba(0,0,0,0.45)]"
                    fill="url(#servicesPeakMassMain)"
                    d="M0 300 L0 188 L78 98 L128 128 L200 32 L272 82 L322 48 L400 148 L400 300 Z"
                />
                {/* Cool sage rim — reads behind warm front line */}
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
                {/* Copper / gold rim + glow — matches PNG backlight */}
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
 * Horizon hero: atmospheric band, gold horizon, three service columns, ridge silhouettes.
 * Copy from siteConfig; server-rendered.
 */
export function ServicesGrid() {
    const peak = siteConfig.services.find((s) => s.slug === "sierra-stack-systems");
    const coaching = siteConfig.services.find((s) => s.slug === "high-elevation-coaching");
    const base = siteConfig.services.find((s) => s.slug === "ascent-nutrition");

    if (!peak || !coaching || !base) {
        return null;
    }

    const tiers = [
        { ...peak, eyebrow: "Summit" },
        { ...coaching, eyebrow: "Ridge" },
        { ...base, eyebrow: "Base camp" },
    ] as const;

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
                    className="relative isolate mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] shadow-[0_28px_72px_rgba(0,0,0,0.55)] md:rounded-[var(--radius-2xl)]"
                    aria-label="Service tiers: Peak Protocols, High Elevation Coaching, Base Camp Nutrition"
                >
                    {/* Atmospheric mesh — aligned with design-mocks/peak-services-horizon-hero-mock.html */}
                    <div className="absolute inset-0 z-0 bg-[var(--color-bg)]" aria-hidden />
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `
                radial-gradient(ellipse 100% 70% at 50% 0%, rgba(217, 119, 6, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 85% 55% at 15% 100%, rgba(45, 90, 61, 0.4) 0%, transparent 52%),
                radial-gradient(ellipse 75% 45% at 88% 95%, rgba(26, 46, 34, 0.55) 0%, transparent 48%),
                linear-gradient(180deg, #121820 0%, var(--color-pine) 38%, #0c0f12 100%)
              `,
                        }}
                        aria-hidden
                    />
                    {/* Warm center bloom behind text — matches PNG */}
                    <div
                        className="pointer-events-none absolute left-1/2 top-[-15%] z-[1] h-[45%] w-[min(90%,520px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.15)_0%,transparent_70%)]"
                        aria-hidden
                    />
                    <ServiceMountains />
                    <div
                        className="absolute inset-0 z-[2] opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
                        aria-hidden
                    />

                    <div className="relative z-[3] px-5 pt-10 pb-32 sm:px-8 sm:pt-12 sm:pb-36 md:px-12 md:pt-14 md:pb-40 lg:px-16 lg:pt-16 lg:pb-48">
                        {/* Horizon line */}
                        <div
                            className="mx-auto mb-9 h-px max-w-3xl bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-[0.72] md:mb-11"
                            aria-hidden
                        />

                        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
                            {tiers.map((tier, index) => (
                                <Link
                                    key={tier.slug}
                                    href={`/services/${tier.slug}`}
                                    className="group relative flex flex-col items-center text-center outline-none md:items-stretch md:text-left focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-xl md:rounded-lg md:px-2 -mx-2 px-4 py-3 md:py-0 transition-colors hover:bg-[color-mix(in_srgb,var(--color-snow)_4%,transparent)]"
                                    aria-label={`${tier.eyebrow}: ${tier.title}. ${tier.shortDescription}`}
                                >
                                    {index > 0 ? (
                                        <span
                                            className="mx-auto mb-6 block h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50 md:hidden"
                                            aria-hidden
                                        />
                                    ) : null}
                                    <span className="label mb-3 block text-center text-[0.7rem] tracking-[0.22em] text-[var(--color-accent)] md:text-left">
                                        {tier.eyebrow}
                                    </span>
                                    <h3 className="text-center font-[family-name:var(--font-outfit)] text-lg font-semibold tracking-tight text-[var(--color-text)] sm:text-xl md:text-left">
                                        {tier.title}
                                    </h3>
                                    <p className="mt-3 max-w-sm text-center text-pretty text-sm leading-relaxed text-[var(--color-text-secondary)] md:max-w-none md:text-left">
                                        {tier.shortDescription}
                                    </p>
                                    <span className="mx-auto mt-5 inline-flex items-center gap-1.5 self-center text-sm font-medium text-[var(--color-accent)] group-hover:gap-2.5 transition-all md:mx-0 md:self-start">
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
