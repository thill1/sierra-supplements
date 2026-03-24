import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { logAdminFailure } from "@/lib/observability";

const updateSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
    title: z.string().min(1).max(300).optional(),
    excerpt: z.string().max(2000).optional().nullable(),
    category: z.string().min(1).max(120).optional(),
    readTime: z.string().min(1).max(40).optional(),
    body: z.string().min(1).max(200_000).optional(),
    published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [row] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, postId))
            .limit(1);
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        logAdminFailure("blog_post_get", error);
        return NextResponse.json(
            { error: "Failed to load post" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, postId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await request.json();
        const data = updateSchema.parse(body);
        const now = new Date();

        const patch: Partial<typeof blogPosts.$inferInsert> = {
            updatedAt: now,
        };
        if (data.slug != null) patch.slug = data.slug;
        if (data.title != null) patch.title = data.title;
        if (data.excerpt !== undefined) patch.excerpt = data.excerpt;
        if (data.category != null) patch.category = data.category;
        if (data.readTime != null) patch.readTime = data.readTime;
        if (data.body != null) patch.body = data.body;
        if (data.published !== undefined) {
            patch.published = data.published;
            if (data.published && !before.publishedAt) {
                patch.publishedAt = now;
            }
            if (!data.published) {
                patch.publishedAt = null;
            }
        }

        const [row] = await db
            .update(blogPosts)
            .set(patch)
            .where(eq(blogPosts.id, postId))
            .returning();

        revalidatePath("/blog");
        revalidatePath(`/blog/${before.slug}`);
        if (row?.slug && row.slug !== before.slug) {
            revalidatePath(`/blog/${row.slug}`);
        }

        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("blog_post_update", error);
        return NextResponse.json(
            { error: "Failed to update post" },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(_request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [gone] = await db
            .select({ slug: blogPosts.slug })
            .from(blogPosts)
            .where(eq(blogPosts.id, postId))
            .limit(1);
        if (!gone) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await db.delete(blogPosts).where(eq(blogPosts.id, postId));
        revalidatePath("/blog");
        revalidatePath(`/blog/${gone.slug}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        logAdminFailure("blog_post_delete", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 },
        );
    }
}
