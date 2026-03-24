import { eq } from "drizzle-orm";
import { db, type DbTransaction } from "@/db";
import { inventoryMovements, productVariants } from "@/db/schema.pg";
import { writeAuditLog } from "@/lib/audit/write-audit";
import type { InventorySource } from "@/lib/inventory/constants";
import { syncParentProductStockFromVariants } from "@/lib/inventory/sync-parent-product-stock";

export type StockChangeParams = {
    variantId: number;
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
 * Single transaction: lock variant row, apply delta, sync parent product stock,
 * insert movement + audit.
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
        variantId,
        delta,
        reason,
        source,
        note,
        actorUserId,
        writeMovementAudit = true,
    } = params;

    const [row] = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .for("update")
        .limit(1);

    if (!row) {
        throw new Error("Variant not found");
    }

    const productId = row.productId;
    const current = row.stockQuantity ?? 0;
    const next = current + delta;
    if (next < 0) {
        throw new InsufficientStockError();
    }

    await tx
        .update(productVariants)
        .set({
            stockQuantity: next,
            updatedAt: new Date(),
        })
        .where(eq(productVariants.id, variantId));

    await syncParentProductStockFromVariants(tx, productId);

    await tx.insert(inventoryMovements).values({
        productId,
        variantId,
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
            before: {
                variantId,
                stockQuantity: current,
            },
            after: {
                variantId,
                stockQuantity: next,
                delta,
                source,
                reason,
            },
        });
    }

    return { newQuantity: next };
}
