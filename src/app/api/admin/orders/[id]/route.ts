import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logAdminFailure } from "@/lib/observability";
import { parseOrderLines, sendOrderStatusEmail } from "@/lib/email/order-emails";
import { isPgMissingSchemaError } from "@/lib/db/compat-errors";

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

const adminOrderSelect = {
    id: orders.id,
    email: orders.email,
    name: orders.name,
    phone: orders.phone,
    addressLine1: orders.addressLine1,
    addressLine2: orders.addressLine2,
    city: orders.city,
    state: orders.state,
    zip: orders.zip,
    items: orders.items,
    subtotal: orders.subtotal,
    autoPay: orders.autoPay,
    notes: orders.notes,
    status: orders.status,
    createdAt: orders.createdAt,
};

type AdminOrder = {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    items: string;
    subtotal: number;
    autoPay: boolean | null;
    notes: string | null;
    status: string | null;
    createdAt: Date | string | null;
    paymentProvider?: string | null;
    paymentSessionId?: string | null;
    stripeCheckoutSessionId?: string | null;
};

async function getAdminOrder(orderId: number): Promise<AdminOrder | null> {
    try {
        const [order] = await db
            .select(adminOrderSelect)
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);
        return order ? withPaymentFallbacks(order) : null;
    } catch (error) {
        if (!isPgMissingSchemaError(error)) throw error;
        logAdminFailure("admin_order_get_compat", error);
        const result = await db.execute(sql`
            select
                id,
                email,
                name,
                phone,
                address_line1 as "addressLine1",
                address_line2 as "addressLine2",
                city,
                state,
                zip,
                items,
                subtotal,
                auto_pay as "autoPay",
                notes,
                status,
                created_at as "createdAt"
            from orders
            where id = ${orderId}
            limit 1
        `);
        const row = result.rows?.[0] as AdminOrder | undefined;
        return row ? withPaymentFallbacks(row) : null;
    }
}

function withPaymentFallbacks(order: AdminOrder): AdminOrder {
    return {
        ...order,
        paymentProvider: order.paymentProvider ?? null,
        paymentSessionId: order.paymentSessionId ?? null,
        stripeCheckoutSessionId: order.stripeCheckoutSessionId ?? null,
    };
}

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const orderId = parseInt(id, 10);
        if (isNaN(orderId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const order = await getAdminOrder(orderId);
        if (!order) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        let lines;
        try {
            lines = await db
                .select()
                .from(orderItems)
                .where(eq(orderItems.orderId, orderId));
        } catch (error) {
            if (!isPgMissingSchemaError(error)) throw error;
            logAdminFailure("admin_order_items_get_compat", error);
            lines = parseOrderLines(order.items);
        }

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
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const orderId = parseInt(id, 10);
        if (isNaN(orderId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const before = await getAdminOrder(orderId);
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
                .returning(adminOrderSelect);
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

        const savedOrder = order ? withPaymentFallbacks(order) : null;

        if (
            savedOrder &&
            data.status !== undefined &&
            data.status !== before.status &&
            savedOrder.email
        ) {
            await sendOrderStatusEmail({
                id: savedOrder.id,
                email: savedOrder.email,
                name: savedOrder.name,
                phone: savedOrder.phone,
                addressLine1: savedOrder.addressLine1,
                addressLine2: savedOrder.addressLine2,
                city: savedOrder.city,
                state: savedOrder.state,
                zip: savedOrder.zip,
                subtotal: savedOrder.subtotal,
                status: savedOrder.status,
                paymentProvider: savedOrder.paymentProvider ?? null,
                paymentSessionId: savedOrder.paymentSessionId ?? null,
                notes: savedOrder.notes,
                autoPay: savedOrder.autoPay,
                lines: parseOrderLines(savedOrder.items),
            });
        }

        return NextResponse.json({ order: savedOrder });
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
