import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const updateSchema = z.object({
    slug: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    shortDescription: z.string().optional().nullable(),
    description: z.string().min(1).optional(),
    price: z.number().int().positive().optional(),
    compareAtPrice: z.number().int().positive().optional().nullable(),
    category: z.string().min(1).optional(),
    image: z.string().optional().nullable(),
    inStock: z.boolean().optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await request.json();
        const raw = {
            ...body,
            price: body.price != null ? Math.round(body.price * 100) : undefined,
            compareAtPrice:
                body.compareAtPrice != null
                    ? Math.round(body.compareAtPrice * 100)
                    : undefined,
        };
        const data = updateSchema.parse(raw);

        const [product] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, productId))
            .returning();

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, {
                status: 404,
            });
        }
        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Admin product update error:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await db.delete(products).where(eq(products.id, productId));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin product delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
