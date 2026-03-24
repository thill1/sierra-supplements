import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { adminUsers, type AdminRole } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { requireMinRole } from "@/lib/admin-auth";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { logAdminFailure } from "@/lib/observability";

const roleEnum = z.enum(["owner", "manager", "editor"]);

const createSchema = z.object({
    email: z.string().min(3).max(320).email(),
    role: roleEnum,
});

export async function GET() {
    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "owner");
    if (forbidden) return forbidden;

    try {
        const rows = await db
            .select()
            .from(adminUsers)
            .orderBy(asc(adminUsers.email));
        return NextResponse.json(rows);
    } catch (error) {
        logAdminFailure("admin_users_list", error);
        return NextResponse.json(
            { error: "Failed to load users" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "owner");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = createSchema.parse(body);
        const email = data.email.trim().toLowerCase();

        const [existing] = await db
            .select({ id: adminUsers.id })
            .from(adminUsers)
            .where(eq(adminUsers.email, email))
            .limit(1);
        if (existing) {
            return NextResponse.json(
                { error: "An admin with this email already exists" },
                { status: 409 },
            );
        }

        const [row] = await db
            .insert(adminUsers)
            .values({
                email,
                role: data.role as AdminRole,
                active: true,
            })
            .returning();

        return NextResponse.json(row, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("admin_user_create", error);
        return NextResponse.json(
            { error: "Failed to create admin user" },
            { status: 500 },
        );
    }
}
