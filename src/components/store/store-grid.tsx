import { ProductCard } from "./product-card";
import { getHardcodedProducts } from "@/lib/products-data";

export async function StoreGrid({
    category,
}: { category?: string | null } = {}) {
    const products = getHardcodedProducts(category);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                    <p className="body-lg text-[var(--color-text-muted)]">
                        No products in this category.
                    </p>
                </div>
            ) : (
                products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))
            )}
        </div>
    );
}
