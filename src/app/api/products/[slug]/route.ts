import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { publicCatalogProductWhere } from "@/lib/store/public-catalog-filter";
import { toPublicProduct } from "@/lib/store/public-product";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
    try {
        const { slug } = await params;
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
            .where(and(eq(products.slug, slug), publicCatalogProductWhere))
            .limit(1);

        const product = result[0];
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(toPublicProduct(product));
    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
