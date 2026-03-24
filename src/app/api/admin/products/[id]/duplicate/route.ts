import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { duplicateVariantsForProduct } from "@/lib/products/variant-helpers";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";

type Params = { params: Promise<{ id: string }> };

function slugifyCopy(slug: string): string {
    const base = slug.replace(/-copy\d*$/i, "");
    return `${base}-copy-${Date.now().toString(36)}`;
}

export async function POST(_request: Request, { params }: Params) {
    const limited = await rateLimitAdminWrite(_request);
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

        const [src] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
        if (!src) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const newSlug = slugifyCopy(src.slug);

        const [clone] = await db.transaction(async (tx) => {
            const [p] = await tx
                .insert(products)
                .values({
                    slug: newSlug,
                    name: `${src.name} (copy)`,
                    shortDescription: src.shortDescription,
                    description: src.description,
                    price: src.price,
                    compareAtPrice: src.compareAtPrice,
                    category: src.category,
                    image: src.image,
                    inStock: src.inStock,
                    published: false,
                    featured: false,
                    sku: src.sku ? `${src.sku}-copy` : null,
                    stockQuantity: 0,
                    lowStockThreshold: src.lowStockThreshold,
                    status: "draft",
                    primaryImageUrl: src.primaryImageUrl,
                    seoTitle: src.seoTitle,
                    seoDescription: src.seoDescription,
                    stripePriceId: null,
                })
                .returning();

            if (p) {
                const imgs = await tx
                    .select()
                    .from(productImages)
                    .where(eq(productImages.productId, productId));

                for (const im of imgs) {
                    await tx.insert(productImages).values({
                        productId: p.id,
                        url: im.url,
                        kind: im.kind,
                        sortOrder: im.sortOrder,
                        altText: im.altText,
                    });
                }

                await duplicateVariantsForProduct(tx, productId, p.id);

                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "product",
                    entityId: String(p.id),
                    action: "duplicate",
                    after: { fromId: productId, slug: p.slug },
                });
            }
            return [p];
        });

        return NextResponse.json(clone, { status: 201 });
    } catch (error) {
        logAdminFailure("product_duplicate", error);
        return NextResponse.json(
            { error: "Failed to duplicate product" },
            { status: 500 },
        );
    }
}
