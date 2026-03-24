import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/require-admin";
import { logAdminFailure } from "@/lib/observability";

export async function GET(request: Request) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { db } = await import("@/db");
        const { leads } = await import("@/db/schema");
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status")?.trim();
        const source = searchParams.get("source")?.trim();

        const conditions = [];
        if (status) {
            conditions.push(eq(leads.status, status));
        }
        if (source) {
            conditions.push(eq(leads.source, source));
        }
        const where =
            conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db
            .select()
            .from(leads)
            .where(where)
            .orderBy(desc(leads.createdAt));
        return NextResponse.json(result);
    } catch (error) {
        logAdminFailure("leads_list", error);
        return NextResponse.json(
            { error: "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
