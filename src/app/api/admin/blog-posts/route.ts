import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { logAdminFailure } from "@/lib/observability";

const createSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(300),
    excerpt: z.string().max(2000).optional().nullable(),
    category: z.string().min(1).max(120).optional(),
    readTime: z.string().min(1).max(40).optional(),
    body: z.string().min(1).max(200_000),
    published: z.boolean().optional(),
});

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const rows = await db
            .select()
            .from(blogPosts)
            .orderBy(desc(blogPosts.updatedAt), desc(blogPosts.id));
        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("blog_posts_list", error);
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = createSchema.parse(body);
        const now = new Date();
        const published = data.published ?? false;

        const [row] = await db
            .insert(blogPosts)
            .values({
                slug: data.slug,
                title: data.title,
                excerpt: data.excerpt ?? null,
                category: data.category ?? "General",
                readTime: data.readTime ?? "5 min",
                body: data.body,
                published,
                publishedAt: published ? now : null,
                updatedAt: now,
            })
            .returning();

        if (row?.published) {
            revalidatePath("/blog");
            revalidatePath(`/blog/${row.slug}`);
        }

        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("blog_post_create", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 },
        );
    }
}
