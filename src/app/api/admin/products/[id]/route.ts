import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { adminProductUpdateSchema } from "@/lib/admin/schemas/product";
import {
    applyEditorProductRestrictions,
    dollarsToCents,
} from "@/lib/admin/product-mutations";
import { writeAuditLog } from "@/lib/audit/write-audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        logAdminFailure("product_get", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const body = await request.json();
        const coerced = {
            ...body,
            price:
                body.price != null && body.price !== ""
                    ? Number(body.price)
                    : undefined,
            compareAtPrice:
                body.compareAtPrice != null && body.compareAtPrice !== ""
                    ? Number(body.compareAtPrice)
                    : body.compareAtPrice,
        };
        const filtered = applyEditorProductRestrictions(coerced, admin);
        const data = adminProductUpdateSchema.parse(filtered);

        const patch: Record<string, unknown> = { updatedAt: new Date() };

        if (data.slug != null) patch.slug = data.slug;
        if (data.name != null) patch.name = data.name;
        if (data.shortDescription !== undefined) {
            patch.shortDescription = data.shortDescription;
        }
        if (data.description != null) patch.description = data.description;
        if (data.price != null) patch.price = dollarsToCents(data.price);
        if (data.compareAtPrice !== undefined) {
            patch.compareAtPrice =
                data.compareAtPrice != null
                    ? dollarsToCents(data.compareAtPrice)
                    : null;
        }
        if (data.category != null) {
            if (
                !(productCategories as readonly string[]).includes(data.category)
            ) {
                return NextResponse.json(
                    { error: "Invalid category" },
                    { status: 400 },
                );
            }
            patch.category = data.category;
        }
        if (data.image !== undefined) patch.image = data.image;
        if (data.inStock != null) patch.inStock = data.inStock;
        if (data.published != null) patch.published = data.published;
        if (data.featured != null) patch.featured = data.featured;
        if (data.sku !== undefined) patch.sku = data.sku;
        if (data.stockQuantity != null) patch.stockQuantity = data.stockQuantity;
        if (data.lowStockThreshold != null) {
            patch.lowStockThreshold = data.lowStockThreshold;
        }
        if (data.status != null) patch.status = data.status;
        if (data.primaryImageUrl !== undefined) {
            patch.primaryImageUrl = data.primaryImageUrl;
        }
        if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
        if (data.seoDescription !== undefined) {
            patch.seoDescription = data.seoDescription;
        }
        if (data.stripePriceId !== undefined) {
            patch.stripePriceId = data.stripePriceId;
        }

        if (data.stockQuantity != null || data.inStock != null) {
            const nextQty =
                (patch.stockQuantity as number | undefined) ??
                before.stockQuantity;
            const explicitInStock = patch.inStock as boolean | undefined;
            if (explicitInStock !== undefined && data.stockQuantity == null) {
                patch.inStock = explicitInStock;
            } else {
                patch.inStock = nextQty > 0;
            }
        }

        const [product] = await db.transaction(async (tx) => {
            const [p] = await tx
                .update(products)
                .set(patch as typeof products.$inferInsert)
                .where(eq(products.id, productId))
                .returning();

            if (p) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "product",
                    entityId: String(productId),
                    action: "update",
                    before,
                    after: p,
                });
            }
            return [p];
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, {
                status: 404,
            });
        }
        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("product_update", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 },
        );
    }
}

/** Soft-archive (preferred over hard delete). */
export async function DELETE(request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const [product] = await db.transaction(async (tx) => {
            const [p] = await tx
                .update(products)
                .set({
                    status: "archived",
                    published: false,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, productId))
                .returning();

            if (p) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "product",
                    entityId: String(productId),
                    action: "archive",
                    before,
                    after: p,
                });
            }
            return [p];
        });

        return NextResponse.json({ success: true, product });
    } catch (error) {
        logAdminFailure("product_archive", error);
        return NextResponse.json(
            { error: "Failed to archive product" },
            { status: 500 },
        );
    }
}
