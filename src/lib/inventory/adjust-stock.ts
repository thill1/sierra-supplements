import { eq } from "drizzle-orm";
import { db, type DbTransaction } from "@/db";
import { inventoryMovements, products, productVariants } from "@/db/schema.pg";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { notifyLowStockIfNeeded } from "@/lib/email/admin-notifications";
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

export type StockChangeResult = {
  newQuantity: number;
  previousQuantity: number;
  lowStockThreshold: number;
  variantId: number;
  productId: number;
  variantLabel: string;
};

/**
 * Single transaction: lock variant row, apply delta, sync parent product stock,
 * insert movement + audit. After commit, sends low-stock admin email when applicable.
 */
export async function applyStockChange(
  params: StockChangeParams,
): Promise<{ newQuantity: number }> {
  const full = await db.transaction(async (tx) => {
    return applyStockChangeInTx(tx, params);
  });
  if (params.delta < 0) {
    await notifyLowStockIfNeeded({
      previousQty: full.previousQuantity,
      newQty: full.newQuantity,
      lowStockThreshold: full.lowStockThreshold,
      productId: full.productId,
      variantId: full.variantId,
      variantLabel: full.variantLabel,
    });
  }
  return { newQuantity: full.newQuantity };
}

export async function applyStockChangeInTx(
  tx: DbTransaction,
  params: StockChangeParams,
): Promise<StockChangeResult> {
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
  const lowStockThreshold = row.lowStockThreshold ?? 2;
  const variantLabel = row.label ?? "Default";
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

  return {
    newQuantity: next,
    previousQuantity: current,
    lowStockThreshold,
    variantId: row.id,
    productId,
    variantLabel,
  };
}

/**
 * Decrement/increment parent `products.stock_quantity` when there is no variant row
 * (e.g. `product_variants` migration not applied yet). Uses `variant_id` = null on movements.
 */
export async function applyParentProductStockInTx(
  tx: DbTransaction,
  params: {
    productId: number;
    delta: number;
    reason: string;
    source: InventorySource;
    note?: string | null;
    actorUserId: number | null;
    writeMovementAudit?: boolean;
  },
): Promise<StockChangeResult> {
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
  const lowStockThreshold = row.lowStockThreshold ?? 2;
  const next = current + delta;
  if (next < 0) {
    throw new InsufficientStockError();
  }

  await tx
    .update(products)
    .set({
      stockQuantity: next,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await tx.insert(inventoryMovements).values({
    productId,
    variantId: null,
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
        variantId: null,
        stockQuantity: current,
      },
      after: {
        variantId: null,
        stockQuantity: next,
        delta,
        source,
        reason,
      },
    });
  }

  return {
    newQuantity: next,
    previousQuantity: current,
    lowStockThreshold,
    variantId: 0,
    productId,
    variantLabel: "Product inventory",
  };
}
