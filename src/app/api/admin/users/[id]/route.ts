import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { adminUsers, type AdminRole } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { logAdminFailure } from "@/lib/observability";

const roleEnum = z.enum(["owner", "manager", "editor"]);

const patchSchema = z
    .object({
        role: roleEnum.optional(),
        active: z.boolean().optional(),
    })
    .refine((d) => d.role !== undefined || d.active !== undefined, {
        message: "At least one of role or active is required",
    });

async function otherActiveOwnerCount(excludeUserId: number): Promise<number> {
    const [r] = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(adminUsers)
        .where(
            and(
                eq(adminUsers.role, "owner"),
                eq(adminUsers.active, true),
                ne(adminUsers.id, excludeUserId),
            ),
        );
    return r?.c ?? 0;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "owner");
    if (forbidden) return forbidden;

    try {
        const { id } = await params;
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const [target] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.id, userId))
            .limit(1);
        if (!target) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await request.json();
        const data = patchSchema.parse(body);

        if (target.role === "owner" && target.active) {
            if (data.role !== undefined && data.role !== "owner") {
                const n = await otherActiveOwnerCount(userId);
                if (n < 1) {
                    return NextResponse.json(
                        {
                            error: "Cannot change role: at least one active owner is required",
                        },
                        { status: 400 },
                    );
                }
            }
            if (data.active === false) {
                const n = await otherActiveOwnerCount(userId);
                if (n < 1) {
                    return NextResponse.json(
                        {
                            error: "Cannot deactivate: at least one active owner is required",
                        },
                        { status: 400 },
                    );
                }
            }
        }

        const patch: Partial<typeof adminUsers.$inferInsert> = {};
        if (data.role !== undefined) patch.role = data.role as AdminRole;
        if (data.active !== undefined) patch.active = data.active;

        const [row] = await db
            .update(adminUsers)
            .set(patch)
            .where(eq(adminUsers.id, userId))
            .returning();

        return NextResponse.json(row);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("admin_user_patch", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 },
        );
    }
}
