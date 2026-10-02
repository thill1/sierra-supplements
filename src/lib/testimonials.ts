import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@/lib/site-config";
import { PUBLIC_HOMEPAGE_CACHE_SECONDS } from "@/lib/public-homepage-cache";

export type Testimonial = {
    name: string;
    role: string;
    quote: string;
    avatar?: string | null;
    rating: number;
};

async function loadTestimonials(): Promise<Testimonial[]> {
    const { db } = await import("@/db");
    const { testimonials } = await import("@/db/schema");
    const rows = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.published, true))
        .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
    if (rows.length > 0) {
        return rows.map((r) => ({
            name: r.name,
            role: r.role,
            quote: r.quote,
            avatar: r.avatar,
            rating: r.rating ?? 5,
        }));
    }
    return siteConfig.testimonials.map((t) => ({
        name: t.name,
        role: t.role,
        quote: t.quote,
        avatar: t.avatar,
        rating: t.rating,
    }));
}

export const getTestimonials = unstable_cache(
    loadTestimonials,
    ["testimonials-v1"],
    { revalidate: PUBLIC_HOMEPAGE_CACHE_SECONDS, tags: ["testimonials"] },
);
