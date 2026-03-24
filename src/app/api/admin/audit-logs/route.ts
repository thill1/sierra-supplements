import { NextResponse } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(200).optional().default(50),
    offset: z.coerce.number().int().min(0).max(100_000).optional().default(0),
    entityType: z.string().max(120).optional(),
    from: z.string().max(40).optional(),
    to: z.string().max(40).optional(),
});

export async function GET(request: Request) {
    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { searchParams } = new URL(request.url);
        const parsed = querySchema.safeParse({
            limit: searchParams.get("limit") ?? undefined,
            offset: searchParams.get("offset") ?? undefined,
            entityType: searchParams.get("entityType")?.trim() || undefined,
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
        });
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid query", details: parsed.error.issues },
                { status: 400 },
            );
        }
        const { limit, offset, entityType, from, to } = parsed.data;

        const conditions = [];
        if (entityType) {
            conditions.push(eq(auditLogs.entityType, entityType));
        }
        if (from) {
            const d = new Date(from);
            if (!Number.isNaN(d.getTime())) {
                conditions.push(gte(auditLogs.createdAt, d));
            }
        }
        if (to) {
            const d = new Date(to);
            if (!Number.isNaN(d.getTime())) {
                conditions.push(lte(auditLogs.createdAt, d));
            }
        }
        const where =
            conditions.length > 0 ? and(...conditions) : undefined;

        const [countRow] = await db
            .select({ c: sql<number>`count(*)::int` })
            .from(auditLogs)
            .where(where);

        const rows = await db
            .select()
            .from(auditLogs)
            .where(where)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            items: rows,
            total: countRow?.c ?? 0,
            limit,
            offset,
        });
    } catch (error) {
        logAdminFailure("audit_logs_list", error);
        return NextResponse.json(
            { error: "Failed to load audit logs" },
            { status: 500 },
        );
    }
}
