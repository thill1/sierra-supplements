import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAuth } from "@/lib/require-auth";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

const createSchema = z.object({
    name: z.string().min(1).max(200),
    role: z.string().min(1).max(200),
    quote: z.string().min(1).max(2000),
    avatar: z.string().max(500).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
});

export async function GET() {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const rows = await db
            .select()
            .from(testimonials)
            .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Admin testimonials fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch testimonials" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const body = await request.json();
        const data = createSchema.parse(body);
        const [row] = await db
            .insert(testimonials)
            .values({
                name: data.name,
                role: data.role,
                quote: data.quote,
                avatar: data.avatar ?? null,
                rating: data.rating ?? 5,
                sortOrder: data.sortOrder ?? 0,
                published: data.published ?? true,
            })
            .returning();
        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Admin testimonial create error:", error);
        return NextResponse.json(
            { error: "Failed to create testimonial" },
            { status: 500 }
        );
    }
}
