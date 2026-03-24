import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";
import { applyStockChange, InsufficientStockError } from "@/lib/inventory/adjust-stock";
import { logAdminFailure } from "@/lib/observability";

const bodySchema = z.object({
    variantId: z.number().int().positive(),
    delta: z.number().int().refine((n) => n !== 0, "delta cannot be 0"),
    note: z.string().max(1000).optional().nullable(),
});

export async function POST(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const json = await request.json();
        const data = bodySchema.parse(json);

        const result = await applyStockChange({
            variantId: data.variantId,
            delta: data.delta,
            reason: "manual_adjustment",
            source: INVENTORY_SOURCE.adjustment,
            note: data.note ?? null,
            actorUserId: admin.id,
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        if (error instanceof InsufficientStockError) {
            return NextResponse.json(
                { error: "Not enough stock for this adjustment" },
                { status: 400 },
            );
        }
        logAdminFailure("inventory_adjust", error);
        return NextResponse.json(
            { error: "Failed to adjust inventory" },
            { status: 500 },
        );
    }
}
