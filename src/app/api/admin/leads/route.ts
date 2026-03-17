import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { db } = await import("@/db");
        const { leads } = await import("@/db/schema");
        const result = await db
            .select()
            .from(leads)
            .orderBy(desc(leads.createdAt));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Admin leads fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
