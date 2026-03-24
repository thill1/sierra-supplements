import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(500).optional().default(100),
    type: z.string().max(120).optional(),
});

/**
 * Read-only analytics for client-side events (page views, clicks).
 * Metadata may include session IDs; treat exports as sensitive.
 */
export async function GET(request: Request) {
    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { searchParams } = new URL(request.url);
        const parsed = querySchema.safeParse({
            limit: searchParams.get("limit") ?? undefined,
            type: searchParams.get("type")?.trim() || undefined,
        });
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid query", details: parsed.error.issues },
                { status: 400 },
            );
        }
        const { limit, type } = parsed.data;

        const typeFilter = type ? eq(events.type, type) : undefined;

        const byTypeRows = await db
            .select({
                type: events.type,
                c: sql<number>`count(*)::int`,
            })
            .from(events)
            .groupBy(events.type)
            .limit(80);
        const byType = [...byTypeRows].sort((a, b) => b.c - a.c).slice(0, 40);

        const items = await db
            .select()
            .from(events)
            .where(typeFilter)
            .orderBy(desc(events.createdAt))
            .limit(limit);

        return NextResponse.json({
            byType,
            items,
            retentionNote:
                "Events are retained until you prune the table; avoid exporting raw rows without a privacy review.",
        });
    } catch (error) {
        logAdminFailure("admin_events_list", error);
        return NextResponse.json(
            { error: "Failed to load events" },
            { status: 500 },
        );
    }
}
