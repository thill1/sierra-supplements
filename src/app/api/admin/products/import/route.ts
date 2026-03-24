import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { rateLimitAdminUpload } from "@/lib/admin-rate-limit";
import {
    adminProductCreateSchema,
    adminProductUpdateSchema,
} from "@/lib/admin/schemas/product";
import { applyEditorProductRestrictions } from "@/lib/admin/product-mutations";
import {
    createAdminProductInTransaction,
    updateAdminProductInTransaction,
} from "@/lib/admin/product-persistence";
import {
    csvRowToCreateInput,
    csvRowToUpdateInput,
    getInventoryCsvLimits,
    parseInventoryCsvText,
    resolveInventoryLookupSlug,
} from "@/lib/admin/inventory-csv";
import { z } from "zod/v4";

type FailedRow = { line: number; message: string };

function isPgUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
    );
}

export async function POST(request: Request) {
    const limited = await rateLimitAdminUpload(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    const { maxFileBytes } = getInventoryCsvLimits();

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "Expected multipart field \"file\"" },
                { status: 400 },
            );
        }
        if (file.size > maxFileBytes) {
            return NextResponse.json(
                {
                    error: `File too large (max ${Math.round(maxFileBytes / 1024)} KB)`,
                },
                { status: 400 },
            );
        }

        const text = await file.text();
        const parsed = parseInventoryCsvText(text);
        if (!parsed.ok) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        let created = 0;
        let updated = 0;
        const failed: FailedRow[] = [];

        for (const row of parsed.rows) {
            const lookupSlug = resolveInventoryLookupSlug(row.fields);
            if (!lookupSlug) {
                failed.push({
                    line: row.line,
                    message:
                        "slug is required (or provide name to derive slug)",
                });
                continue;
            }

            const [existing] = await db
                .select()
                .from(products)
                .where(eq(products.slug, lookupSlug))
                .limit(1);

            try {
                if (existing) {
                    const prep = csvRowToUpdateInput(row.fields);
                    if (!prep.ok) {
                        failed.push({ line: row.line, message: prep.message });
                        continue;
                    }
                    const filtered = applyEditorProductRestrictions(
                        prep.data,
                        admin,
                    );
                    const data = adminProductUpdateSchema.parse(filtered);

                    const result = await db.transaction(async (tx) => {
                        return updateAdminProductInTransaction(
                            tx,
                            admin,
                            existing,
                            existing.id,
                            data,
                        );
                    });

                    if (!result.ok) {
                        failed.push({
                            line: row.line,
                            message: "Invalid category",
                        });
                        continue;
                    }
                    updated += 1;
                } else {
                    const prep = csvRowToCreateInput(row.fields);
                    if (!prep.ok) {
                        failed.push({ line: row.line, message: prep.message });
                        continue;
                    }
                    const filtered = applyEditorProductRestrictions(
                        prep.data,
                        admin,
                    );
                    const data = adminProductCreateSchema.parse(filtered);

                    await db.transaction(async (tx) => {
                        await createAdminProductInTransaction(tx, admin, data);
                    });
                    created += 1;
                }
            } catch (err) {
                if (isPgUniqueViolation(err)) {
                    failed.push({
                        line: row.line,
                        message: "Duplicate slug or unique constraint violation",
                    });
                    continue;
                }
                if (err instanceof z.ZodError) {
                    const issue = err.issues[0];
                    failed.push({
                        line: row.line,
                        message: issue
                            ? `${issue.path.join(".")}: ${issue.message}`
                            : "Validation failed",
                    });
                    continue;
                }
                logAdminFailure("product_csv_import_row", err);
                failed.push({
                    line: row.line,
                    message:
                        err instanceof Error ? err.message : "Import failed",
                });
            }
        }

        return NextResponse.json({ created, updated, failed });
    } catch (error) {
        logAdminFailure("product_csv_import", error);
        return NextResponse.json(
            { error: "Failed to import CSV" },
            { status: 500 },
        );
    }
}
