import { eq } from "drizzle-orm";
import { db, type DbTransaction } from "@/db";
import { products, inventoryMovements } from "@/db/schema.pg";
import { writeAuditLog } from "@/lib/audit/write-audit";
import type { InventorySource } from "@/lib/inventory/constants";

export type StockChangeParams = {
    productId: number;
    delta: number;
    reason: string;
    source: InventorySource;
    note?: string | null;
    actorUserId: number | null;
    /** When false, skip audit row (use only if caller writes a richer audit). Default true. */
    writeMovementAudit?: boolean;
};

export class InsufficientStockError extends Error {
    constructor(message = "Insufficient stock") {
        super(message);
        this.name = "InsufficientStockError";
    }
}

/**
 * Single transaction: lock row, apply delta, sync in_stock, insert movement + audit.
 */
export async function applyStockChange(
    params: StockChangeParams,
): Promise<{ newQuantity: number }> {
    return db.transaction(async (tx) => {
        return applyStockChangeInTx(tx, params);
    });
}

export async function applyStockChangeInTx(
    tx: DbTransaction,
    params: StockChangeParams,
): Promise<{ newQuantity: number }> {
    const {
        productId,
        delta,
        reason,
        source,
        note,
        actorUserId,
        writeMovementAudit = true,
    } = params;

    const [row] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for("update")
        .limit(1);

    if (!row) {
        throw new Error("Product not found");
    }

    const current = row.stockQuantity ?? 0;
    const next = current + delta;
    if (next < 0) {
        throw new InsufficientStockError();
    }

    const inStock = next > 0;

    await tx
        .update(products)
        .set({
            stockQuantity: next,
            inStock,
            updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

    await tx.insert(inventoryMovements).values({
        productId,
        delta,
        reason,
        source,
        note: note ?? null,
        actorUserId,
    });

    if (writeMovementAudit) {
        await writeAuditLog(tx, {
            actorUserId,
            entityType: "inventory",
            entityId: String(productId),
            action: "stock_change",
            before: { stockQuantity: current, inStock: row.inStock },
            after: { stockQuantity: next, inStock, delta, source, reason },
        });
    }

    return { newQuantity: next };
}
