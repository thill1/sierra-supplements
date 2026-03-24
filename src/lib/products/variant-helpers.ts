import { asc, eq } from "drizzle-orm";
import type { DbTransaction } from "@/db";
import { products, productVariants } from "@/db/schema.pg";
import { syncParentProductStockFromVariants } from "@/lib/inventory/sync-parent-product-stock";

type ProductRow = {
    id: number;
    name: string;
    price: number;
    compareAtPrice: number | null;
    sku: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    stripePriceId: string | null;
};

export async function insertDefaultVariantForProduct(
    tx: DbTransaction,
    p: ProductRow,
): Promise<void> {
    await tx.insert(productVariants).values({
        productId: p.id,
        label: "Default",
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        stripePriceId: p.stripePriceId,
        sortOrder: 0,
    });
}

export async function duplicateVariantsForProduct(
    tx: DbTransaction,
    sourceProductId: number,
    newProductId: number,
): Promise<void> {
    const variants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, sourceProductId))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));

    if (variants.length === 0) {
        const [prod] = await tx
            .select()
            .from(products)
            .where(eq(products.id, newProductId))
            .limit(1);
        if (prod) {
            await insertDefaultVariantForProduct(tx, {
                id: prod.id,
                name: prod.name,
                price: prod.price,
                compareAtPrice: prod.compareAtPrice ?? null,
                sku: prod.sku ?? null,
                stockQuantity: prod.stockQuantity,
                lowStockThreshold: prod.lowStockThreshold,
                stripePriceId: prod.stripePriceId ?? null,
            });
        }
        return;
    }

    for (const v of variants) {
        await tx.insert(productVariants).values({
            productId: newProductId,
            label: v.label,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            sku: v.sku ? `${v.sku}-copy` : null,
            stockQuantity: 0,
            lowStockThreshold: v.lowStockThreshold,
            stripePriceId: null,
            sortOrder: v.sortOrder,
        });
    }

    await syncParentProductStockFromVariants(tx, newProductId);
}
