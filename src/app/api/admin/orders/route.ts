import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
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
