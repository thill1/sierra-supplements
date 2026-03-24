import { NextResponse } from "next/server";
import { and, eq, notInArray } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { adminProductVariantsReplaceSchema } from "@/lib/admin/schemas/product-variant";
import { dollarsToCents } from "@/lib/admin/product-mutations";
import { syncParentProductStockFromVariants } from "@/lib/inventory/sync-parent-product-stock";
import { writeAuditLog } from "@/lib/audit/write-audit";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [product] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, {
                status: 404,
            });
        }

        const json = await request.json();
        const data = adminProductVariantsReplaceSchema.parse(json);

        const keptIds = await db.transaction(async (tx) => {
            const ids: number[] = [];

            for (const row of data.variants) {
                const priceCents = dollarsToCents(row.price);
                const compareCents =
                    row.compareAtPrice != null
                        ? dollarsToCents(row.compareAtPrice)
                        : null;

                if (row.id != null) {
                    const updated = await tx
                        .update(productVariants)
                        .set({
                            label: row.label,
                            price: priceCents,
                            compareAtPrice: compareCents,
                            sku: row.sku ?? null,
                            stockQuantity: row.stockQuantity,
                            lowStockThreshold: row.lowStockThreshold,
                            stripePriceId: row.stripePriceId ?? null,
                            sortOrder: row.sortOrder,
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(productVariants.id, row.id),
                                eq(productVariants.productId, productId),
                            ),
                        )
                        .returning({ id: productVariants.id });

                    if (updated.length === 0) {
                        throw new Error("INVALID_VARIANT_ID");
                    }
                    ids.push(row.id);
                } else {
                    const [inserted] = await tx
                        .insert(productVariants)
                        .values({
                            productId,
                            label: row.label,
                            price: priceCents,
                            compareAtPrice: compareCents,
                            sku: row.sku ?? null,
                            stockQuantity: row.stockQuantity,
                            lowStockThreshold: row.lowStockThreshold,
                            stripePriceId: row.stripePriceId ?? null,
                            sortOrder: row.sortOrder,
                        })
                        .returning({ id: productVariants.id });
                    if (inserted) {
                        ids.push(inserted.id);
                    }
                }
            }

            if (ids.length > 0) {
                await tx
                    .delete(productVariants)
                    .where(
                        and(
                            eq(productVariants.productId, productId),
                            notInArray(productVariants.id, ids),
                        ),
                    );
            }

            await syncParentProductStockFromVariants(tx, productId);

            const [p] = await tx
                .select()
                .from(products)
                .where(eq(products.id, productId))
                .limit(1);

            await writeAuditLog(tx, {
                actorUserId: admin.id,
                entityType: "product",
                entityId: String(productId),
                action: "variants_replace",
                after: { variantIds: ids, productStock: p?.stockQuantity },
            });

            return ids;
        });

        const list = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, productId));

        return NextResponse.json({ variantIds: keptIds, variants: list });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        if (
            error instanceof Error &&
            error.message === "INVALID_VARIANT_ID"
        ) {
            return NextResponse.json(
                { error: "Invalid variant id for this product" },
                { status: 400 },
            );
        }
        logAdminFailure("product_variants_replace", error);
        return NextResponse.json(
            { error: "Failed to save variants" },
            { status: 500 },
        );
    }
}
