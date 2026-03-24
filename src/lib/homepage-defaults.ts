import { siteConfig } from "@/lib/site-config";

export type HomepageLeadMagnet = {
    title: string;
    subtitle: string;
    cta: string;
};

export type HomepageHero = {
    footerTagline: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    servicesLinkLabel: string;
    stats: { value: string; label: string }[];
};

export type HomepageContentStored = {
    leadMagnet: HomepageLeadMagnet;
    hero: HomepageHero;
};

export function defaultHomepageContent(): HomepageContentStored {
    return {
        leadMagnet: {
            title: siteConfig.leadMagnet.title,
            subtitle: siteConfig.leadMagnet.subtitle,
            cta: siteConfig.leadMagnet.cta,
        },
        hero: {
            footerTagline:
                "Auburn, CA · Third-Party Tested · Science-Backed",
            primaryCtaLabel: "Shop Supplements",
            secondaryCtaLabel: "Free Consultation",
            servicesLinkLabel: "Services",
            stats: [
                { value: "50+", label: "Premium Products" },
                { value: "-", label: "Nutrition Coaching" },
                { value: "100%", label: "Third-Party Tested" },
                { value: "500+", label: "Clients Served" },
            ],
        },
    };
}

export function mergeHomepageContent(
    stored: unknown,
): HomepageContentStored {
    const base = defaultHomepageContent();
    if (!stored || typeof stored !== "object") {
        return base;
    }
    const s = stored as Partial<HomepageContentStored>;
    return {
        leadMagnet: {
            ...base.leadMagnet,
            ...(typeof s.leadMagnet === "object" && s.leadMagnet
                ? s.leadMagnet
                : {}),
        },
        hero: {
            ...base.hero,
            ...(typeof s.hero === "object" && s.hero ? s.hero : {}),
            stats:
                Array.isArray(s.hero?.stats) && s.hero.stats.length > 0
                    ? s.hero.stats
                    : base.hero.stats,
        },
    };
}
