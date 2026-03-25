import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/** Section narrative — production copy (service titles/descriptions come from siteConfig). */
const SERVICES_INTRO =
    "From base camp to the summit, each tier builds on the last: nutrition as your foundation, coaching on the climb, and personalized protocols at the peak. Explore where you want to start—or stack every level for the full ascent.";

/** Master art: `public/previews/horizon-hero-services-master.png` (1024×571). */
const HERO_MASTER_SRC = "/previews/horizon-hero-services-master.png";

const BURNT_ORANGE = "#cc5500";
const BURNT_ORANGE_SOFT = "#d35400";

/**
 * Angular ridgelines over the raster mountains — burnt orange (replaces gold in artwork).
 * Geometry is faceted to match the reference style; scales with the card width.
 */
function ServiceBurntOrangeRidges() {
    const backRidgeD =
        "M0 138 L34 108 L62 115 L96 95 L128 102 L158 90 L190 96 L220 86 L252 92 L282 80 L312 84 L342 76 L372 80 L400 70";
    const frontRidgeD =
        "M0 124 L44 90 L74 100 L110 60 L142 74 L178 40 L208 54 L238 44 L268 54 L298 47 L328 57 L358 50 L388 62 L400 102";

    return (
        <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[min(46%,260px)] min-h-[140px]"
            aria-hidden
        >
            <svg
                className="h-full w-full"
                viewBox="0 0 400 160"
                preserveAspectRatio="xMidYMax meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter
                        id="servicesBurntRidgeGlow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                        colorInterpolationFilters="sRGB"
                    >
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="g" />
                        <feMerge>
                            <feMergeNode in="g" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    fill="none"
                    stroke={BURNT_ORANGE_SOFT}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.65}
                    opacity={0.55}
                    vectorEffect="nonScalingStroke"
                    d={backRidgeD}
                />
                <path
                    fill="none"
                    stroke={BURNT_ORANGE}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.45}
                    vectorEffect="nonScalingStroke"
                    filter="url(#servicesBurntRidgeGlow)"
                    d={frontRidgeD}
                />
            </svg>
        </div>
    );
}

/**
 * Horizon hero — uses approved master PNG for pixel-accurate art; overlays add burnt-orange bloom + ridge accents.
 * Three column links are invisible hit targets (copy is in the image); labels are exposed to assistive tech.
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
                    className="relative isolate w-full max-w-5xl overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] shadow-[0_28px_72px_rgba(0,0,0,0.55)] md:rounded-[var(--radius-2xl)] aspect-[1024/571]"
                    aria-label="Service tiers: Peak Protocols, High Elevation Coaching, Base Camp Nutrition"
                >
                    <div className="absolute inset-0 z-0 bg-[#121513]" aria-hidden />

                    <div className="absolute inset-0 z-[1]">
                        <Image
                            src={HERO_MASTER_SRC}
                            alt=""
                            fill
                            className="object-cover object-center select-none"
                            sizes="(max-width: 1024px) 100vw, 896px"
                            priority={false}
                        />
                    </div>

                    {/* Stronger burnt-orange top bloom (on top of artwork). */}
                    <div
                        className="pointer-events-none absolute inset-0 z-[2]"
                        style={{
                            background: `
                radial-gradient(ellipse 92% 72% at 50% -6%, rgba(204, 85, 0, 0.38) 0%, transparent 52%),
                radial-gradient(ellipse 78% 58% at 50% 10%, rgba(211, 84, 0, 0.26) 0%, transparent 58%),
                radial-gradient(ellipse 55% 40% at 50% 0%, rgba(255, 140, 66, 0.12) 0%, transparent 45%)
              `,
                        }}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute left-1/2 top-[-10%] z-[2] h-[58%] w-[min(98%,600px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(211,84,0,0.34)_0%,rgba(204,85,0,0.14)_38%,transparent_72%)]"
                        aria-hidden
                    />

                    <ServiceBurntOrangeRidges />

                    {/* Full-width column links; artwork supplies visible labels. */}
                    <div className="absolute inset-0 z-[4] grid grid-cols-3">
                        {tiers.map((tier) => (
                            <Link
                                key={tier.slug}
                                href={`/services/${tier.slug}`}
                                className="relative h-full min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--color-accent)_90%,#cc5500)] focus-visible:ring-offset-0"
                                aria-label={`${tier.title}. ${tier.shortDescription}. Explore service.`}
                            >
                                <span className="sr-only">
                                    {tier.title}. {tier.shortDescription}. Explore.
                                </span>
                            </Link>
                        ))}
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
