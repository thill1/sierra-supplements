import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages, productImageKinds } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";

const kindSchema = z.enum(productImageKinds);

const postSchema = z.object({
    url: z.string().min(1).max(2000),
    kind: kindSchema,
    altText: z.string().max(500).optional().nullable(),
    sortOrder: z.number().int().optional(),
});

const patchSchema = z.object({
    primaryImageUrl: z.string().min(1).max(2000).optional().nullable(),
    order: z
        .array(
            z.object({
                id: z.number().int().positive(),
                sortOrder: z.number().int(),
                kind: kindSchema.optional(),
            }),
        )
        .optional(),
});

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

        const rows = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, productId))
            .orderBy(productImages.sortOrder);

        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("product_images_list", error);
        return NextResponse.json(
            { error: "Failed to load images" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request, { params }: Params) {
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

        const [p] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
        if (!p) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const body = await request.json();
        const data = postSchema.parse(body);

        const [row] = await db.transaction(async (tx) => {
            const [img] = await tx
                .insert(productImages)
                .values({
                    productId,
                    url: data.url,
                    kind: data.kind,
                    altText: data.altText ?? null,
                    sortOrder: data.sortOrder ?? 0,
                })
                .returning();

            if (img) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "product_image",
                    entityId: String(img.id),
                    action: "create",
                    after: { productId, ...data },
                });
            }
            return [img];
        });

        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("product_image_create", error);
        return NextResponse.json(
            { error: "Failed to add image" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request, { params }: Params) {
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
        const data = patchSchema.parse(body);

        await db.transaction(async (tx) => {
            if (data.order?.length) {
                for (const item of data.order) {
                    await tx
                        .update(productImages)
                        .set({
                            sortOrder: item.sortOrder,
                            ...(item.kind != null ? { kind: item.kind } : {}),
                        })
                        .where(
                            and(
                                eq(productImages.id, item.id),
                                eq(productImages.productId, productId),
                            ),
                        );
                }
            }

            let nextProduct = before;
            if (data.primaryImageUrl !== undefined) {
                const [upd] = await tx
                    .update(products)
                    .set({
                        primaryImageUrl: data.primaryImageUrl,
                        image: data.primaryImageUrl ?? before.image,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, productId))
                    .returning();
                if (upd) nextProduct = upd;
            }

            await writeAuditLog(tx, {
                actorUserId: admin.id,
                entityType: "product",
                entityId: String(productId),
                action: "images_reorder",
                before,
                after: nextProduct,
            });
        });

        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        return NextResponse.json({ success: true, product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("product_images_patch", error);
        return NextResponse.json(
            { error: "Failed to update images" },
            { status: 500 },
        );
    }
}
