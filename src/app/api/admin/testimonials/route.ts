import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logAdminFailure } from "@/lib/observability";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

const createSchema = z.object({
    name: z.string().min(1).max(200),
    role: z.string().min(1).max(200),
    quote: z.string().min(1).max(2000),
    avatar: z.string().max(500).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
    sortOrder: z.number().int().optional(),
    published: z.boolean().optional(),
});

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const rows = await db
            .select()
            .from(testimonials)
            .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("testimonials_list", error);
        return NextResponse.json(
            { error: "Failed to fetch testimonials" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = createSchema.parse(body);
        const [row] = await db.transaction(async (tx) => {
            const [r] = await tx
                .insert(testimonials)
                .values({
                    name: data.name,
                    role: data.role,
                    quote: data.quote,
                    avatar: data.avatar ?? null,
                    rating: data.rating ?? 5,
                    sortOrder: data.sortOrder ?? 0,
                    published: data.published ?? true,
                })
                .returning();
            if (r) {
                await writeAuditLog(tx, {
                    actorUserId: admin.id,
                    entityType: "testimonial",
                    entityId: String(r.id),
                    action: "create",
                    after: r,
                });
            }
            return [r];
        });
        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        logAdminFailure("testimonial_create", error);
        return NextResponse.json(
            { error: "Failed to create testimonial" },
            { status: 500 }
        );
    }
}
