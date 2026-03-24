import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { adminProductUpdateSchema } from "@/lib/admin/schemas/product";
import { applyEditorProductRestrictions } from "@/lib/admin/product-mutations";
import { updateAdminProductInTransaction } from "@/lib/admin/product-persistence";
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

        const variants = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, productId))
            .orderBy(
                asc(productVariants.sortOrder),
                asc(productVariants.id),
            );

        return NextResponse.json({ ...product, variants });
    } catch (error) {
        logAdminFailure("product_get", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request, { params }: Params) {
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

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

        const result = await db.transaction(async (tx) => {
            return updateAdminProductInTransaction(
                tx,
                admin,
                before,
                productId,
                data,
            );
        });

        if (!result.ok) {
            return NextResponse.json(
                { error: "Invalid category" },
                { status: 400 },
            );
        }
        return NextResponse.json(result.product);
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
