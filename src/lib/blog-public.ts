import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import {
    legacyBlogPostsBySlug,
    legacyBlogSummaries,
} from "@/lib/blog-legacy";

export type BlogListItem = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    source: "db" | "legacy";
};

export type BlogPostDetail = {
    slug: string;
    title: string;
    category: string;
    date: string;
    readTime: string;
    content: string;
};

function formatPostDate(d: Date | null | undefined): string {
    if (!d) return "";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export async function getPublishedBlogList(): Promise<BlogListItem[]> {
    try {
        const rows = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.published, true))
            .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id));

        const dbSlugs = new Set(rows.map((r) => r.slug));
        const fromDb: BlogListItem[] = rows.map((r) => ({
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt ?? r.body.slice(0, 180).trim() + "…",
            category: r.category,
            date: formatPostDate(r.publishedAt ?? r.createdAt),
            readTime: r.readTime,
            source: "db" as const,
        }));

        const fromLegacy = legacyBlogSummaries
            .filter((p) => !dbSlugs.has(p.slug))
            .map(
                (p): BlogListItem => ({
                    slug: p.slug,
                    title: p.title,
                    excerpt: p.excerpt,
                    category: p.category,
                    date: p.date,
                    readTime: p.readTime,
                    source: "legacy",
                }),
            );

        return [...fromDb, ...fromLegacy];
    } catch {
        return legacyBlogSummaries.map(
            (p): BlogListItem => ({
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                category: p.category,
                date: p.date,
                readTime: p.readTime,
                source: "legacy",
            }),
        );
    }
}

export async function resolvePublishedBlogPost(
    slug: string,
): Promise<BlogPostDetail | null> {
    try {
        const [row] = await db
            .select()
            .from(blogPosts)
            .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
            .limit(1);
        if (row) {
            return {
                slug: row.slug,
                title: row.title,
                category: row.category,
                date: formatPostDate(row.publishedAt ?? row.createdAt),
                readTime: row.readTime,
                content: row.body,
            };
        }
    } catch {
        /* fall through to legacy */
    }

    const legacy = legacyBlogPostsBySlug[slug];
    if (!legacy) return null;
    return {
        slug,
        title: legacy.title,
        category: legacy.category,
        date: legacy.date,
        readTime: legacy.readTime,
        content: legacy.content,
    };
}

export async function allBlogSlugsForStaticParams(): Promise<string[]> {
    try {
        const rows = await db
            .select({ slug: blogPosts.slug })
            .from(blogPosts)
            .where(eq(blogPosts.published, true));
        const set = new Set<string>([
            ...rows.map((r) => r.slug),
            ...Object.keys(legacyBlogPostsBySlug),
        ]);
        return [...set];
    } catch {
        return Object.keys(legacyBlogPostsBySlug);
    }
}
