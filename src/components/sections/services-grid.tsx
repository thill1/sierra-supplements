import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Section narrative — production copy (service titles/descriptions come from siteConfig). */
const SERVICES_INTRO =
    "From base camp to the summit, each tier builds on the last: nutrition as your foundation, coaching on the climb, and personalized protocols at the peak. Explore where you want to start—or stack every level for the full ascent.";

function ServiceMountains() {
    return (
        <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[30%] min-h-[7.5rem] max-h-[11rem] md:min-h-[9rem] md:max-h-[13rem]"
            aria-hidden
        >
            <svg
                className="h-full w-full text-[#0d1812]"
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="services-ridge-front" x1="600" y1="20" x2="600" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0a1210" />
                        <stop offset="0.45" stopColor="#152820" />
                        <stop offset="1" stopColor="var(--color-pine)" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="services-ridge-mist" x1="600" y1="0" x2="600" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--color-pine)" stopOpacity="0.12" />
                        <stop offset="0.55" stopColor="var(--color-pine)" stopOpacity="0.38" />
                        <stop offset="1" stopColor="#0a1210" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                {/* Mist layer — wider, softer */}
                <path
                    d="M0 200 V130 Q180 95 360 125 T720 85 T1080 105 L1200 115 V200 H0Z"
                    fill="url(#services-ridge-mist)"
                />
                {/* Primary range — multi-peak silhouette */}
                <path
                    d="M0 200 L0 145 L180 100 L290 128 L430 78 L520 108 L620 62 L740 98 L860 72 L960 95 L1080 68 L1200 95 L1200 200 Z"
                    fill="url(#services-ridge-front)"
                />
                {/* Crest catchlight */}
                <path
                    d="M0 145 L180 100 L290 128 L430 78 L520 108 L620 62 L740 98 L860 72 L960 95 L1080 68 L1200 95"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeOpacity={0.22}
                    strokeWidth={1.25}
                    vectorEffect="non-scaling-stroke"
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
                    className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] shadow-[0_28px_72px_rgba(0,0,0,0.55)] md:rounded-[var(--radius-2xl)]"
                    aria-label="Service tiers: Peak Protocols, High Elevation Coaching, Base Camp Nutrition"
                >
                    {/* Atmospheric mesh */}
                    <div
                        className="absolute inset-0 bg-[var(--color-bg)]"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 opacity-[0.97]"
                        style={{
                            background: `
                radial-gradient(ellipse 90% 70% at 50% -15%, rgba(217, 119, 6, 0.12), transparent 52%),
                radial-gradient(ellipse 70% 50% at 85% 40%, rgba(45, 90, 61, 0.22), transparent 48%),
                radial-gradient(ellipse 65% 45% at 10% 55%, rgba(45, 90, 61, 0.18), transparent 45%),
                linear-gradient(180deg, #121a16 0%, var(--color-bg) 38%, #0a0e0d 100%)
              `,
                        }}
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
                        aria-hidden
                    />

                    <div className="relative z-[2] px-5 pt-10 pb-28 sm:px-8 sm:pt-12 sm:pb-32 md:px-12 md:pt-14 md:pb-36 lg:px-16 lg:pt-16 lg:pb-40">
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

                    <ServiceMountains />
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
