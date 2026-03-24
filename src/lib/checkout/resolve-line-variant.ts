import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";

export type CheckoutLineInput = {
    productId: number;
    /** 0 = resolve default variant (e.g. hardcoded catalog). */
    variantId: number;
    slug?: string;
    quantity: number;
};

/**
 * variantId 0 = resolve first variant (hardcoded-catalog fallback or legacy carts).
 * Otherwise require variant to exist and belong to productId.
 */
export async function resolveLineToVariantIds(
    line: Pick<CheckoutLineInput, "productId" | "variantId" | "slug">,
): Promise<{ productId: number; variantId: number }> {
    if (line.variantId > 0) {
        const [v] = await db
            .select()
            .from(productVariants)
            .where(
                and(
                    eq(productVariants.id, line.variantId),
                    eq(productVariants.productId, line.productId),
                ),
            )
            .limit(1);
        if (!v) {
            throw new Error(
                `Unknown variant ${line.variantId} for product ${line.productId}`,
            );
        }
        return { productId: line.productId, variantId: v.id };
    }

    let productId = line.productId;
    if (line.slug) {
        const [p] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.slug, line.slug))
            .limit(1);
        if (p) {
            productId = p.id;
        }
    }

    const [def] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id))
        .limit(1);

    if (!def) {
        throw new Error(`No sellable variant for product ${productId}`);
    }

    return { productId, variantId: def.id };
}
