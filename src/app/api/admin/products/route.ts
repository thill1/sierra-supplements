import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod/v4";

const createSchema = z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    shortDescription: z.string().optional(),
    description: z.string().min(1),
    price: z.number().int().positive(),
    compareAtPrice: z.number().int().positive().optional().nullable(),
    category: z.string().min(1),
    image: z.string().optional().nullable(),
    inStock: z.boolean().optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
});

export async function GET() {
    try {
        const result = await db
            .select()
            .from(products)
            .orderBy(desc(products.createdAt));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin products fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = createSchema.parse({
            ...body,
            price: Math.round((body.price || 0) * 100),
            compareAtPrice: body.compareAtPrice
                ? Math.round(body.compareAtPrice * 100)
                : null,
        });

        const [product] = await db
            .insert(products)
            .values({
                slug: data.slug,
                name: data.name,
                shortDescription: data.shortDescription ?? null,
                description: data.description,
                price: data.price,
                compareAtPrice: data.compareAtPrice ?? null,
                category: data.category,
                image: data.image ?? null,
                inStock: data.inStock ?? true,
                published: data.published ?? false,
                featured: data.featured ?? false,
            })
            .returning();

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Admin product create error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
