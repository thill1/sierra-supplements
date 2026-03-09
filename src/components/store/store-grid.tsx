import { ProductCard } from "./product-card";
import { getHardcodedProducts } from "@/lib/products-data";

async function getProductsFromDb(category?: string | null) {
    try {
        const { db } = await import("@/db");
        const { products } = await import("@/db/schema");
        const { eq, desc, and } = await import("drizzle-orm");
        const conditions = [eq(products.published, true)];
        if (category) conditions.push(eq(products.category, category));
        return await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.featured), desc(products.createdAt));
    } catch {
        return null;
    }
}

export async function StoreGrid({
    category,
}: { category?: string | null } = {}) {
    const dbProducts = await getProductsFromDb(category);
    const items = dbProducts && dbProducts.length > 0
        ? dbProducts
        : getHardcodedProducts(category);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
                <div className="col-span-full text-center py-16">
                    <p className="body-lg text-[var(--color-text-muted)]">
                        No products in this category.
                    </p>
                </div>
            ) : (
                items.map((product: { id: number; slug: string; name: string; shortDescription: string | null; price: number; compareAtPrice: number | null; category: string; image: string | null; featured: boolean }) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))
            )}
        </div>
    );
}
