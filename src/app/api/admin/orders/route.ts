import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const result = await db
            .select({
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
            })
            .from(orders)
            .orderBy(desc(orders.createdAt));
        return NextResponse.json(result);
    } catch (error) {
        logAdminFailure("orders_list", error);
        try {
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
                order by created_at desc
            `);
            return NextResponse.json(result.rows ?? []);
        } catch (fallbackError) {
            logAdminFailure("orders_list_fallback", fallbackError);
            return NextResponse.json(
                { error: "Failed to fetch orders" },
                { status: 500 },
            );
        }
    }
}
