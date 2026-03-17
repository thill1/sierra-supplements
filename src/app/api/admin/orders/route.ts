import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { db } = await import("@/db");
        const { orders } = await import("@/db/schema");
        const result = await db
            .select()
            .from(orders)
            .orderBy(desc(orders.createdAt));
        return NextResponse.json(result);
    } catch {
        return NextResponse.json([]);
    }
}
