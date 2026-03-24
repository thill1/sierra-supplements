import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logAdminFailure } from "@/lib/observability";

const patchSchema = z
    .object({
        status: z.string().min(1).max(64).optional(),
        notes: z.string().max(5000).nullable().optional(),
    })
    .refine((d) => d.status !== undefined || d.notes !== undefined, {
        message: "At least one of status or notes is required",
    });

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const leadId = parseInt(id, 10);
        if (isNaN(leadId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [row] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, leadId))
            .limit(1);
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        logAdminFailure("lead_get", error);
        return NextResponse.json(
            { error: "Failed to load lead" },
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
        const leadId = parseInt(id, 10);
        if (isNaN(leadId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, leadId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await request.json();
        const data = patchSchema.parse(body);

        const patch: Partial<typeof leads.$inferInsert> = {};
        if (data.status !== undefined) patch.status = data.status;
        if (data.notes !== undefined) patch.notes = data.notes;

        const [row] = await db.transaction(async (tx) => {
            const [updated] = await tx
                .update(leads)
                .set(patch)
                .where(eq(leads.id, leadId))
                .returning();
            if (updated) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "lead",
                    entityId: String(leadId),
                    action: "update",
                    before: {
                        status: before.status,
                        notes: before.notes,
                    },
                    after: {
                        status: updated.status,
                        notes: updated.notes,
                    },
                });
            }
            return [updated];
        });

        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("lead_patch", error);
        return NextResponse.json(
            { error: "Failed to update lead" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const leadId = parseInt(id, 10);
        if (isNaN(leadId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [before] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, leadId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await db.transaction(async (tx) => {
            await tx.delete(leads).where(eq(leads.id, leadId));
            await writeAuditLog(tx, {
                actorUserId: admin.id,
                entityType: "lead",
                entityId: String(leadId),
                action: "delete",
                before,
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logAdminFailure("lead_delete", error);
        return NextResponse.json(
            { error: "Failed to delete lead" },
            { status: 500 },
        );
    }
}
