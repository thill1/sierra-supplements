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
    quantity: z.number().int().positive().max(999),
    paymentMethod: z.string().max(80).optional().nullable(),
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

        const noteParts = [
            data.paymentMethod
                ? `Payment: ${data.paymentMethod}`
                : null,
            data.note,
        ].filter(Boolean);
        const note = noteParts.length ? noteParts.join(" — ") : null;

        const result = await applyStockChange({
            variantId: data.variantId,
            delta: -data.quantity,
            reason: "in_store_sale",
            source: INVENTORY_SOURCE.inStore,
            note,
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
                { error: "Not enough stock to record this sale" },
                { status: 400 },
            );
        }
        logAdminFailure("inventory_in_store_sale", error);
        return NextResponse.json(
            { error: "Failed to record sale" },
            { status: 500 },
        );
    }
}
