import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "@/lib/require-auth";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { id } = await params;
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [row] = await db
            .select()
            .from(testimonials)
            .where(eq(testimonials.id, testimonialId));
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        console.error("Admin testimonial fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch testimonial" },
            { status: 500 }
        );
    }
}

const updateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    role: z.string().min(1).max(200).optional(),
    quote: z.string().min(1).max(2000).optional(),
    avatar: z.string().max(500).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: Params) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { id } = await params;
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const body = await request.json();
        const data = updateSchema.parse(body);
        const [row] = await db
            .update(testimonials)
            .set(data)
            .where(eq(testimonials.id, testimonialId))
            .returning();
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Admin testimonial update error:", error);
        return NextResponse.json(
            { error: "Failed to update testimonial" },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { id } = await params;
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        await db.delete(testimonials).where(eq(testimonials.id, testimonialId));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin testimonial delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete testimonial" },
            { status: 500 }
        );
    }
}
