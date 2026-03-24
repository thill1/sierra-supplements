import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and, type SQL } from "drizzle-orm";
import { publicCatalogProductWhere } from "@/lib/store/public-catalog-filter";
import { toPublicProduct } from "@/lib/store/public-product";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");

        const conditions: SQL[] = [publicCatalogProductWhere];
        if (category) conditions.push(eq(products.category, category));
        if (featured === "true") conditions.push(eq(products.featured, true));

        const result = await db
            .select({
                id: products.id,
                slug: products.slug,
                name: products.name,
                shortDescription: products.shortDescription,
                description: products.description,
                price: products.price,
                compareAtPrice: products.compareAtPrice,
                category: products.category,
                image: products.image,
                inStock: products.inStock,
                featured: products.featured,
                primaryImageUrl: products.primaryImageUrl,
                seoTitle: products.seoTitle,
                seoDescription: products.seoDescription,
            })
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.featured), desc(products.createdAt));

        return NextResponse.json(result.map(toPublicProduct));
    } catch (error) {
        console.error("Products fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
