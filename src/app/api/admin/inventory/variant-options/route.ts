import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const rows = await db
            .select({
                variantId: productVariants.id,
                productId: productVariants.productId,
                productName: products.name,
                label: productVariants.label,
                stockQuantity: productVariants.stockQuantity,
            })
            .from(productVariants)
            .innerJoin(products, eq(productVariants.productId, products.id))
            .orderBy(asc(products.name), asc(productVariants.sortOrder), asc(productVariants.id));

        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("inventory_variant_options", error);
        return NextResponse.json(
            { error: "Failed to load variant options" },
            { status: 500 },
        );
    }
}
