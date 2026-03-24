import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { logServerError } from "@/lib/observability";

export type CheckoutLineInput = {
  productId: number;
  /** 0 = resolve default variant (e.g. hardcoded catalog). */
  variantId: number;
  slug?: string;
  quantity: number;
};

/**
 * variantId 0 = resolve first variant row, or product-level fallback (`variantId` 0 in session)
 * when `product_variants` is missing or empty.
 * Positive variantId must exist and belong to productId.
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

  try {
    const [def] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.sortOrder), asc(productVariants.id))
      .limit(1);

    if (def) {
      return { productId, variantId: def.id };
    }
  } catch (err) {
    logServerError("checkout:resolve_default_variant", err, {
      productId,
      slug: line.slug,
    });
  }

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  return { productId: product.id, variantId: 0 };
}
