import { eq, sum } from "drizzle-orm";
import type { DbTransaction } from "@/db";
import { products, productVariants } from "@/db/schema.pg";

/**
 * Sets products.stock_quantity to the sum of variant quantities and syncs in_stock.
 */
export async function syncParentProductStockFromVariants(
    tx: DbTransaction,
    productId: number,
): Promise<{ sum: number }> {
    const [agg] = await tx
        .select({
            sum: sum(productVariants.stockQuantity),
        })
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

    const sumQty = Number(agg?.sum ?? 0);
    const inStock = sumQty > 0;

    await tx
        .update(products)
        .set({
            stockQuantity: sumQty,
            inStock,
            updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

    return { sum: sumQty };
}
