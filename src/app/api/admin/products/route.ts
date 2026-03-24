import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";
import { and, desc, eq, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import {
    adminProductCreateSchema,
    productStatusSchema,
} from "@/lib/admin/schemas/product";
import { applyEditorProductRestrictions } from "@/lib/admin/product-mutations";
import { createAdminProductInTransaction } from "@/lib/admin/product-persistence";

export async function GET(request: Request) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const status = searchParams.get("status");
        const stock = searchParams.get("stock");
        const q = searchParams.get("q")?.trim().slice(0, 120);

        const conditions: SQL[] = [];

        if (
            category &&
            (productCategories as readonly string[]).includes(category)
        ) {
            conditions.push(eq(products.category, category));
        }
        if (status) {
            const parsed = productStatusSchema.safeParse(status);
            if (parsed.success) {
                conditions.push(eq(products.status, parsed.data));
            }
        }
        if (stock === "low") {
            conditions.push(
                sql`${products.stockQuantity} > 0 AND ${products.stockQuantity} <= ${products.lowStockThreshold}`,
            );
        } else if (stock === "out") {
            conditions.push(lte(products.stockQuantity, 0));
        } else if (stock === "ok") {
            conditions.push(sql`${products.stockQuantity} > ${products.lowStockThreshold}`);
        }
        if (q) {
            const safe = q.replace(/[%_]/g, "\\$&");
            const nameMatch = ilike(products.name, `%${safe}%`);
            const slugMatch = ilike(products.slug, `%${safe}%`);
            const skuMatch = ilike(products.sku, `%${safe}%`);
            conditions.push(or(nameMatch, slugMatch, skuMatch)!);
        }

        const where =
            conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db
            .select()
            .from(products)
            .where(where)
            .orderBy(desc(products.updatedAt));

        return NextResponse.json(result);
    } catch (error) {
        logAdminFailure("products_list", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = adminProductCreateSchema.parse(
            applyEditorProductRestrictions(
                {
                    ...body,
                    price: body.price,
                    compareAtPrice: body.compareAtPrice,
                },
                admin,
            ),
        );

        const product = await db.transaction(async (tx) => {
            return createAdminProductInTransaction(tx, admin, data);
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("product_create", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 },
        );
    }
}
