import { eq } from "drizzle-orm";
import type { DbTransaction } from "@/db";
import { products, productCategories, productVariants } from "@/db/schema";
import { insertDefaultVariantForProduct } from "@/lib/products/variant-helpers";
import { syncParentProductStockFromVariants } from "@/lib/inventory/sync-parent-product-stock";
import type { ResolvedAdmin } from "@/lib/admin-auth";
import type {
    AdminProductCreateInput,
    AdminProductUpdateInput,
} from "@/lib/admin/schemas/product";
import { dollarsToCents } from "@/lib/admin/product-mutations";
import { writeAuditLog } from "@/lib/audit/write-audit";

export type ProductRow = typeof products.$inferSelect;

export async function createAdminProductInTransaction(
    tx: DbTransaction,
    admin: ResolvedAdmin,
    data: AdminProductCreateInput,
): Promise<ProductRow> {
    const priceCents = dollarsToCents(data.price);
    const compareCents =
        data.compareAtPrice != null
            ? dollarsToCents(data.compareAtPrice)
            : null;

    const stockQty = data.stockQuantity ?? (data.inStock !== false ? 1 : 0);
    const inStock = stockQty > 0;

    const [p] = await tx
        .insert(products)
        .values({
            slug: data.slug,
            name: data.name,
            shortDescription: data.shortDescription ?? null,
            description: data.description,
            price: priceCents,
            compareAtPrice: compareCents,
            category: data.category,
            image: data.image ?? null,
            inStock,
            published: data.published ?? false,
            featured: data.featured ?? false,
            sku: data.sku ?? null,
            stockQuantity: stockQty,
            lowStockThreshold: data.lowStockThreshold ?? 2,
            status: data.status ?? "active",
            primaryImageUrl: data.primaryImageUrl ?? data.image ?? null,
            seoTitle: data.seoTitle ?? null,
            seoDescription: data.seoDescription ?? null,
            stripePriceId: data.stripePriceId ?? null,
        })
        .returning();

    if (!p) {
        throw new Error("Product insert returned no row");
    }

    await insertDefaultVariantForProduct(tx, {
        id: p.id,
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        sku: p.sku ?? null,
        stockQuantity: p.stockQuantity,
        lowStockThreshold: p.lowStockThreshold,
        stripePriceId: p.stripePriceId ?? null,
    });

    await writeAuditLog(tx, {
        actorUserId: admin.id,
        entityType: "product",
        entityId: String(p.id),
        action: "create",
        after: p,
    });

    return p;
}

export type UpdateAdminProductResult =
    | { ok: true; product: ProductRow }
    | { ok: false; error: "invalid_category" };

/**
 * Same semantics as PUT /api/admin/products/[id] (variant rules, stock sync, audit).
 */
export async function updateAdminProductInTransaction(
    tx: DbTransaction,
    admin: ResolvedAdmin,
    before: ProductRow,
    productId: number,
    data: AdminProductUpdateInput,
): Promise<UpdateAdminProductResult> {
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
            return { ok: false, error: "invalid_category" };
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

    const variantRows = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

    if (variantRows.length > 1 && data.stockQuantity != null) {
        delete patch.stockQuantity;
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

    const [p] = await tx
        .update(products)
        .set(patch as typeof products.$inferInsert)
        .where(eq(products.id, productId))
        .returning();

    if (!p) {
        throw new Error("Product update returned no row");
    }

    const vrows = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

    if (vrows.length === 0) {
        await insertDefaultVariantForProduct(tx, {
            id: p.id,
            name: p.name,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? null,
            sku: p.sku ?? null,
            stockQuantity: p.stockQuantity,
            lowStockThreshold: p.lowStockThreshold,
            stripePriceId: p.stripePriceId ?? null,
        });
    } else if (vrows.length === 1) {
        const vid = vrows[0]!.id;
        const vpatch: Partial<typeof productVariants.$inferInsert> = {
            updatedAt: new Date(),
        };
        if (data.stockQuantity != null) {
            vpatch.stockQuantity = data.stockQuantity;
        }
        if (data.price != null) {
            vpatch.price = dollarsToCents(data.price);
        }
        if (data.compareAtPrice !== undefined) {
            vpatch.compareAtPrice =
                data.compareAtPrice != null
                    ? dollarsToCents(data.compareAtPrice)
                    : null;
        }
        if (data.sku !== undefined) {
            vpatch.sku = data.sku;
        }
        if (data.stripePriceId !== undefined) {
            vpatch.stripePriceId = data.stripePriceId;
        }
        if (data.lowStockThreshold != null) {
            vpatch.lowStockThreshold = data.lowStockThreshold;
        }
        if (Object.keys(vpatch).length > 1) {
            await tx
                .update(productVariants)
                .set(vpatch)
                .where(eq(productVariants.id, vid));
        }
    }

    await syncParentProductStockFromVariants(tx, productId);

    const [afterRow] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

    await writeAuditLog(tx, {
        actorUserId: admin.id,
        entityType: "product",
        entityId: String(productId),
        action: "update",
        before,
        after: afterRow ?? p,
    });

    return { ok: true, product: afterRow ?? p };
}
