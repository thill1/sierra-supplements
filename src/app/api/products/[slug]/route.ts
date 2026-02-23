import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        const { slug } = await params;
        const result = await db
            .select()
            .from(products)
            .where(and(eq(products.slug, slug), eq(products.published, true)))
            .limit(1);

        const product = result[0];
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
