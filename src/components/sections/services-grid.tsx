import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Section narrative — production copy (service titles/descriptions come from siteConfig). */
const SERVICES_INTRO =
    "From base camp to the summit, each tier builds on the last: nutrition as your foundation, coaching on the climb, and personalized protocols at the peak. Explore where you want to start—or stack every level for the full ascent.";

/**
 * Layered range — organic Bézier ridgelines, diagonal facet shading, soft ambient shadow,
 * and rim strokes aligned with public/previews/horizon-hero-services-preview.png (not flat polygons).
 */
function ServiceMountains() {
    const burntOrange = "#c25a12";
    const burntOrangeSoft = "#d06b2a";
    /* Closed shapes: bottom L/R corners anchor to viewBox floor. */
    const backMassD =
        "M0 300 L0 211 C 20 198 36 176 50 170 C 68 158 86 178 100 168 C 122 154 142 150 158 154 C 178 158 200 166 222 156 C 242 146 262 132 288 140 C 308 148 334 158 356 150 C 374 144 386 138 400 132 L 400 300 Z";
    const backRidgeD =
        "M0 211 C 20 198 36 176 50 170 C 68 158 86 178 100 168 C 122 154 142 150 158 154 C 178 158 200 166 222 156 C 242 146 262 132 288 140 C 308 148 334 158 356 150 C 374 144 386 138 400 132";
    const frontMassD =
        "M0 300 L0 189 C 28 148 52 98 80 94 C 94 108 112 122 130 112 C 156 68 182 36 202 30 C 222 38 252 74 278 82 C 296 66 314 50 328 44 C 348 70 376 112 400 150 L 400 300 Z";
    const frontRidgeD =
        "M0 189 C 28 148 52 98 80 94 C 94 108 112 122 130 112 C 156 68 182 36 202 30 C 222 38 252 74 278 82 C 296 66 314 50 328 44 C 348 70 376 112 400 150";

    return (
        <div className="pointer-events-none absolute inset-0 z-[1] min-h-[280px]" aria-hidden>
            <svg
                className="block h-[105%] w-full min-h-[320px] translate-y-[2%]"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMax slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter
                        id="servicesPeakAmbientBlur"
                        x="-25%"
                        y="-25%"
                        width="150%"
                        height="150%"
                        colorInterpolationFilters="sRGB"
                    >
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
                        <feColorMatrix
                            in="b"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0"
                            result="dim"
                        />
                    </filter>
                    <filter
                        id="servicesFrontRidgeGlow"
                        x="-40%"
                        y="-40%"
                        width="180%"
                        height="180%"
                        colorInterpolationFilters="sRGB"
                    >
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="servicesPeakMassBack" x1="18%" y1="0%" x2="82%" y2="100%">
                        <stop offset="0%" stopColor="#2a4a38" />
                        <stop offset="38%" stopColor="#1a3226" />
                        <stop offset="72%" stopColor="#0c1812" />
                        <stop offset="100%" stopColor="#030605" />
                    </linearGradient>
                    <linearGradient id="servicesPeakMassMain" x1="12%" y1="5%" x2="88%" y2="95%">
                        <stop offset="0%" stopColor="#3d5e4a" />
                        <stop offset="18%" stopColor="#2d4d3a" />
                        <stop offset="42%" stopColor="#1e3528" />
                        <stop offset="68%" stopColor="#0f1e16" />
                        <stop offset="100%" stopColor="#030605" />
                    </linearGradient>
                    <linearGradient id="servicesPeakFacetShadow" x1="92%" y1="8%" x2="8%" y2="92%">
                        <stop offset="0%" stopColor="#000000" stopOpacity={0} />
                        <stop offset="38%" stopColor="#06100c" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#020403" stopOpacity={0.72} />
                    </linearGradient>
                    <linearGradient id="servicesPeakLitShoulder" x1="0%" y1="0%" x2="55%" y2="75%">
                        <stop offset="0%" stopColor="#4a7260" stopOpacity={0.22} />
                        <stop offset="55%" stopColor="#1f3d2e" stopOpacity={0} />
                        <stop offset="100%" stopColor="#1f3d2e" stopOpacity={0} />
                    </linearGradient>
                    <radialGradient
                        id="servicesPeakSummitBloom"
                        cx="52%"
                        cy="18%"
                        r="55%"
                        fx="50%"
                        fy="12%"
                    >
                        <stop offset="0%" stopColor="#5a8a6e" stopOpacity={0.2} />
                        <stop offset="45%" stopColor="#2a4536" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#0a0f0c" stopOpacity={0} />
                    </radialGradient>
                    <linearGradient
                        id="servicesDistantRim"
                        gradientUnits="userSpaceOnUse"
                        x1={0}
                        y1={168}
                        x2={400}
                        y2={168}
                    >
                        <stop offset="0%" stopColor="#8fa894" stopOpacity={0.35} />
                        <stop offset="50%" stopColor="#b8c9ae" stopOpacity={0.65} />
                        <stop offset="100%" stopColor="#7d9178" stopOpacity={0.4} />
                    </linearGradient>
                </defs>

                {/* Soft mass behind distant range */}
                <path
                    d={backMassD}
                    fill="#050807"
                    opacity={0.35}
                    filter="url(#servicesPeakAmbientBlur)"
                    transform="translate(0 6)"
                />
                <path className="opacity-[0.48]" fill="url(#servicesPeakMassBack)" d={backMassD} />
                <path
                    className="opacity-[0.28]"
                    fill="url(#servicesPeakFacetShadow)"
                    d={backMassD}
                    style={{ mixBlendMode: "multiply" }}
                />

                {/* Foreground: ambient, base mass, facet + summit light */}
                <path
                    d={frontMassD}
                    fill="#030605"
                    opacity={0.28}
                    filter="url(#servicesPeakAmbientBlur)"
                    transform="translate(0 8)"
                />
                <path
                    className="opacity-[0.58] drop-shadow-[0_-4px_28px_rgba(0,0,0,0.5)]"
                    fill="url(#servicesPeakMassMain)"
                    d={frontMassD}
                />
                <path
                    className="opacity-[0.55]"
                    fill="url(#servicesPeakFacetShadow)"
                    d={frontMassD}
                    style={{ mixBlendMode: "multiply" }}
                />
                <path
                    className="opacity-[0.9]"
                    fill="url(#servicesPeakLitShoulder)"
                    d={frontMassD}
                    style={{ mixBlendMode: "soft-light" }}
                />
                <path className="opacity-[0.85]" fill="url(#servicesPeakSummitBloom)" d={frontMassD} />

                <path
                    fill="none"
                    stroke="url(#servicesDistantRim)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.85}
                    vectorEffect="nonScalingStroke"
                    d={backRidgeD}
                />
                <path
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.35}
                    vectorEffect="nonScalingStroke"
                    filter="url(#servicesFrontRidgeGlow)"
                    d={frontRidgeD}
                    style={{
                        stroke: `color-mix(in srgb, ${burntOrangeSoft} 62%, ${burntOrange} 38%)`,
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
                    className="relative isolate flex min-h-[27rem] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] shadow-[0_28px_72px_rgba(0,0,0,0.55)] sm:min-h-[29rem] md:min-h-[32rem] md:rounded-[var(--radius-2xl)] lg:min-h-[35rem]"
                    aria-label="Service tiers: Peak Protocols, High Elevation Coaching, Base Camp Nutrition"
                >
                    {/* Background — warm top-center bloom like PNG; edges fall to deep green/black */}
                    <div className="absolute inset-0 z-0 bg-[var(--color-bg)]" aria-hidden />
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `
                radial-gradient(ellipse 85% 55% at 50% 8%, rgba(194, 90, 18, 0.25) 0%, transparent 55%),
                radial-gradient(ellipse 70% 45% at 50% 0%, rgba(208, 107, 42, 0.1) 0%, transparent 45%),
                radial-gradient(ellipse 90% 60% at 12% 100%, rgba(45, 90, 61, 0.35) 0%, transparent 50%),
                radial-gradient(ellipse 85% 55% at 92% 100%, rgba(26, 46, 34, 0.45) 0%, transparent 48%),
                linear-gradient(180deg, #152018 0%, #0f1612 35%, #0a0e0c 100%)
              `,
                        }}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute left-1/2 top-[-8%] z-[1] h-[52%] w-[min(95%,560px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(194,90,18,0.2)_0%,rgba(194,90,18,0.08)_35%,transparent_68%)]"
                        aria-hidden
                    />
                    <ServiceMountains />
                    <div
                        className="absolute inset-0 z-[2] opacity-[0.025] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
                        aria-hidden
                    />

                    {/* Content: centered columns like PNG; horizon ~upper third of card */}
                    <div className="relative z-[3] flex min-h-0 flex-1 flex-col px-6 pt-8 pb-40 sm:px-10 sm:pt-10 sm:pb-44 md:px-12 md:pt-11 md:pb-48 lg:px-14 lg:pt-12 lg:pb-52">
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
                                    <h3 className="font-[family-name:var(--font-outfit)] text-[2rem] leading-[1.05] font-semibold tracking-tight text-[var(--color-text)] sm:text-[2.15rem] md:text-[2.25rem]">
                                        {tier.title}
                                    </h3>
                                    {/* Preview-matched body treatment: subtle placeholder bars, not paragraph blocks. */}
                                    <div className="mt-4 w-full max-w-[16rem] space-y-2" aria-hidden>
                                        <span className="block h-[5px] rounded-full bg-[color-mix(in_srgb,var(--color-text-secondary)_28%,transparent)]" />
                                        <span className="block h-[5px] w-[84%] rounded-full bg-[color-mix(in_srgb,var(--color-text-secondary)_24%,transparent)]" />
                                    </div>
                                    <span className="sr-only">{tier.shortDescription}</span>
                                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
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
