import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
    inventoryMovements,
    products,
    productVariants,
} from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";

export async function GET(request: Request) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { searchParams } = new URL(request.url);
        const productIdRaw = searchParams.get("productId");
        const limit = Math.min(
            200,
            Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50),
        );

        const pid = productIdRaw ? parseInt(productIdRaw, 10) : NaN;
        const filterProduct = Number.isFinite(pid);

        const rows = await db
            .select({
                id: inventoryMovements.id,
                productId: inventoryMovements.productId,
                variantId: inventoryMovements.variantId,
                productName: sql<string>`CASE WHEN ${productVariants.id} IS NOT NULL THEN ${products.name} || ' — ' || ${productVariants.label} ELSE ${products.name} END`,
                delta: inventoryMovements.delta,
                reason: inventoryMovements.reason,
                source: inventoryMovements.source,
                note: inventoryMovements.note,
                createdAt: inventoryMovements.createdAt,
            })
            .from(inventoryMovements)
            .innerJoin(products, eq(inventoryMovements.productId, products.id))
            .leftJoin(
                productVariants,
                eq(inventoryMovements.variantId, productVariants.id),
            )
            .where(
                filterProduct
                    ? and(eq(inventoryMovements.productId, pid))
                    : undefined,
            )
            .orderBy(desc(inventoryMovements.createdAt))
            .limit(limit);

        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("inventory_movements_list", error);
        return NextResponse.json(
            { error: "Failed to load movements" },
            { status: 500 },
        );
    }
}
