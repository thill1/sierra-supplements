import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin, requireAdminOrRespond } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logAdminFailure } from "@/lib/observability";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await params;
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [row] = await db
            .select()
            .from(testimonials)
            .where(eq(testimonials.id, testimonialId));
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        logAdminFailure("testimonial_get", error);
        return NextResponse.json(
            { error: "Failed to fetch testimonial" },
            { status: 500 }
        );
    }
}

const updateSchema = z
    .object({
        name: z.string().min(1).max(200).optional(),
        role: z.string().min(1).max(200).optional(),
        quote: z.string().min(1).max(2000).optional(),
        avatar: z.string().max(500).optional().nullable(),
        rating: z.number().int().min(1).max(5).optional(),
        sortOrder: z.number().int().optional(),
        published: z.boolean().optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
        message: "At least one field is required",
    });

export async function PUT(request: Request, { params }: Params) {
    const limited = await rateLimitAdminWrite(request);
    if (limited) return limited;

    const auth = requireAdminOrRespond(await requireAdmin());
    if (auth instanceof NextResponse) return auth;
    const { admin } = auth;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [before] = await db
            .select()
            .from(testimonials)
            .where(eq(testimonials.id, testimonialId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const body = await request.json();
        const data = updateSchema.parse(body);
        const [row] = await db.transaction(async (tx) => {
            const [updated] = await tx
                .update(testimonials)
                .set(data)
                .where(eq(testimonials.id, testimonialId))
                .returning();
            if (updated) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "testimonial",
                    entityId: String(testimonialId),
                    action: "update",
                    before,
                    after: updated,
                });
            }
            return [updated];
        });
        if (!row) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        logAdminFailure("testimonial_update", error);
        return NextResponse.json(
            { error: "Failed to update testimonial" },
            { status: 500 }
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
        const testimonialId = parseInt(id, 10);
        if (isNaN(testimonialId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const [before] = await db
            .select()
            .from(testimonials)
            .where(eq(testimonials.id, testimonialId))
            .limit(1);
        if (!before) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await db.transaction(async (tx) => {
            await tx
                .delete(testimonials)
                .where(eq(testimonials.id, testimonialId));
            await writeAuditLog(tx, {
                actorUserId: admin.id,
                entityType: "testimonial",
                entityId: String(testimonialId),
                action: "delete",
                before,
            });
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        logAdminFailure("testimonial_delete", error);
        return NextResponse.json(
            { error: "Failed to delete testimonial" },
            { status: 500 }
        );
    }
}
