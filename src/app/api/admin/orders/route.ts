import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { db } = await import("@/db");
        const { orders } = await import("@/db/schema");
        const result = await db
            .select()
            .from(orders)
            .orderBy(desc(orders.createdAt));
        return NextResponse.json(result);
    } catch (error) {
        logAdminFailure("orders_list", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 },
        );
    }
}
