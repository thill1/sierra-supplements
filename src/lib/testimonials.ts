import { asc, eq } from "drizzle-orm";
import { siteConfig } from "@/lib/site-config";

export type Testimonial = {
    name: string;
    role: string;
    quote: string;
    avatar?: string | null;
    rating: number;
};

export async function getTestimonials(): Promise<Testimonial[]> {
    try {
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
    } catch {
        // DB unavailable
    }
    return siteConfig.testimonials.map((t) => ({
        name: t.name,
        role: t.role,
        quote: t.quote,
        avatar: t.avatar,
        rating: t.rating,
    }));
}
