import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logAdminFailure } from "@/lib/observability";

const orderStatuses = [
    "pending",
    "paid",
    "packed",
    "fulfilled",
    "cancelled",
    "refunded",
] as const;

const patchSchema = z
    .object({
        status: z.enum(orderStatuses).optional(),
        notes: z.string().max(5000).nullable().optional(),
        name: z.string().max(200).nullable().optional(),
        phone: z.string().max(40).nullable().optional(),
        addressLine1: z.string().max(200).nullable().optional(),
        addressLine2: z.string().max(200).nullable().optional(),
        city: z.string().max(120).nullable().optional(),
        state: z.string().max(80).nullable().optional(),
        zip: z.string().max(20).nullable().optional(),
    })
    .refine(
        (d) =>
            d.status !== undefined ||
            d.notes !== undefined ||
            d.name !== undefined ||
            d.phone !== undefined ||
            d.addressLine1 !== undefined ||
            d.addressLine2 !== undefined ||
            d.city !== undefined ||
            d.state !== undefined ||
            d.zip !== undefined,
        { message: "At least one field is required" },
    );

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const orderId = parseInt(id, 10);
        if (isNaN(orderId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);
        if (!order) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const lines = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));

        return NextResponse.json({ order, lineItems: lines });
    } catch (error) {
        logAdminFailure("admin_order_get", error);
        return NextResponse.json(
            { error: "Failed to load order" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const orderId = parseInt(id, 10);
        if (isNaN(orderId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await request.json();
        const data = patchSchema.parse(body);

        const set: Partial<typeof orders.$inferInsert> = {};
        if (data.status !== undefined) set.status = data.status;
        if (data.notes !== undefined) set.notes = data.notes;
        if (data.name !== undefined) set.name = data.name;
        if (data.phone !== undefined) set.phone = data.phone;
        if (data.addressLine1 !== undefined) {
            set.addressLine1 = data.addressLine1;
        }
        if (data.addressLine2 !== undefined) {
            set.addressLine2 = data.addressLine2;
        }
        if (data.city !== undefined) set.city = data.city;
        if (data.state !== undefined) set.state = data.state;
        if (data.zip !== undefined) set.zip = data.zip;

        const beforeSlice = {
            status: before.status,
            notes: before.notes,
            name: before.name,
            phone: before.phone,
            addressLine1: before.addressLine1,
            addressLine2: before.addressLine2,
            city: before.city,
            state: before.state,
            zip: before.zip,
        };
        const afterSlice = { ...beforeSlice, ...set };

        const [order] = await db.transaction(async (tx) => {
            const [o] = await tx
                .update(orders)
                .set(set)
                .where(eq(orders.id, orderId))
                .returning();
            if (o) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "order",
                    entityId: String(orderId),
                    action: "update",
                    before: beforeSlice,
                    after: afterSlice,
                });
            }
            return [o];
        });

        return NextResponse.json({ order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("admin_order_patch", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 },
        );
    }
}
