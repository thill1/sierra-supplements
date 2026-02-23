import { ProductCard } from "./product-card";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

async function getProducts(category?: string | null) {
    try {
        const conditions = [eq(products.published, true)];
        if (category) conditions.push(eq(products.category, category));
        return await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.featured), desc(products.createdAt));
    } catch {
        return [];
    }
}

export async function StoreGrid({
    category,
}: { category?: string | null } = {}) {
    const products = await getProducts(category);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                    <p className="body-lg text-[var(--color-text-muted)] mb-4">
                        No products yet. Run the seed script to add placeholder
                        products:
                    </p>
                    <code className="text-sm bg-[var(--color-surface)] px-3 py-1 rounded">
                        pnpm db:push && pnpm db:seed
                    </code>
                </div>
            ) : (
                products.map((product: Record<string, unknown>) => (
                    <ProductCard key={product.id as number} product={product as Parameters<typeof ProductCard>[0]["product"]} />
                ))
            )}
        </div>
    );
}
