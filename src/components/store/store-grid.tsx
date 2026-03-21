import { ProductCard } from "./product-card";
import { getHardcodedProducts } from "@/lib/products-data";
import { allowHardcodedCatalogFallback } from "@/lib/catalog-policy";
import { CatalogUnavailableError } from "@/lib/catalog-errors";
import type { Product } from "@/types/store";

function dbRowToProduct(row: {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    featured: boolean | null;
}): Product {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortDescription: row.shortDescription,
        description: row.description,
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        category: row.category,
        image: row.image,
        featured: row.featured ?? false,
    };
}

async function getProductsFromDb(
    category?: string | null,
): Promise<{ ok: true; products: Product[] } | { ok: false }> {
    try {
        const { db } = await import("@/db");
        const { products } = await import("@/db/schema");
        const { eq, desc, and } = await import("drizzle-orm");
        const conditions = [eq(products.published, true)];
        if (category) conditions.push(eq(products.category, category));
        const rows = await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.featured), desc(products.createdAt));
        return { ok: true, products: rows.map(dbRowToProduct) };
    } catch {
        return { ok: false };
    }
}

export async function StoreGrid({
    category,
}: { category?: string | null } = {}) {
    const fallback = allowHardcodedCatalogFallback();
    const dbResult = await getProductsFromDb(category);

    if (!dbResult.ok) {
        if (fallback) {
            const items = getHardcodedProducts(category);
            return <ProductGrid items={items} />;
        }
        throw new CatalogUnavailableError();
    }

    let items = dbResult.products;
    if (items.length === 0 && fallback) {
        items = getHardcodedProducts(category);
    }

    return <ProductGrid items={items} />;
}

function ProductGrid({ items }: { items: Product[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
                <div className="col-span-full text-center py-16">
                    <p className="body-lg text-[var(--color-text-muted)]">
                        No products in this category.
                    </p>
                </div>
            ) : (
                items.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                ))
            )}
        </div>
    );
}
