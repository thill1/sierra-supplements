import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { db } from "@/db";
import { adminUsers, type AdminRole } from "@/db/schema.pg";
import { isUserAdmin } from "@/lib/admin-allowlist";
import { logAdminAuthzFailure } from "@/lib/observability";
import { roleMeetsMinimum as roleMeetsMinimumRank } from "@/lib/admin-role";

export type AdminRow = typeof adminUsers.$inferSelect;

/** Resolved admin for authz; `id` is null only when DB has no admin_users yet and env allowlist applies (bootstrap). */
export type ResolvedAdmin = {
    id: number | null;
    email: string;
    role: AdminRole;
};

export async function getAdminByEmail(
    email: string | null | undefined,
): Promise<AdminRow | null> {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    const [row] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, norm))
        .limit(1);
    return row ?? null;
}

/**
 * Prefer an **active** `admin_users` row (role + id from DB).
 * Otherwise, if `ADMIN_EMAILS` contains this address, grant access: same as empty-table
 * bootstrap when there is no row, or re-admit when a row exists but `active` is false
 * (so Vercel allowlist stays authoritative without a manual DB fix).
 * No row / inactive row and not on allowlist → deny.
 */
export async function resolveAdmin(
    email: string | null | undefined,
): Promise<ResolvedAdmin | null> {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    const row = await getAdminByEmail(norm);
    if (row?.active) {
        return { id: row.id, email: norm, role: row.role as AdminRole };
    }
    if (isUserAdmin(norm)) {
        return {
            id: row?.id ?? null,
            email: norm,
            role: (row?.role as AdminRole) ?? "owner",
        };
    }
    return null;
}

export function roleMeetsMinimum(role: AdminRole, minRole: AdminRole): boolean {
    return roleMeetsMinimumRank(role, minRole);
}

export function requireRoleOrThrow(
    admin: ResolvedAdmin,
    minRole: AdminRole,
): void {
    if (!roleMeetsMinimumRank(admin.role, minRole)) {
        throw new AdminForbiddenError("Insufficient role");
    }
}

export class AdminForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AdminForbiddenError";
    }
}

export type RequireAdminDbResult =
    | { admin: ResolvedAdmin; session: Session; response: null }
    | { admin: null; session: null; response: NextResponse };

/**
 * Server-only: session must be authenticated; admin must be active in DB or bootstrap env allowlist.
 */
export async function requireAdminDb(
    session: Session | null,
): Promise<RequireAdminDbResult> {
    const email = session?.user?.email;
    if (!session?.user || !email) {
        return {
            admin: null,
            session: null,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const admin = await resolveAdmin(email);
    if (!admin) {
        logAdminAuthzFailure("require_admin_db", email);
        return {
            admin: null,
            session: null,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }

    return { admin, session, response: null };
}

/**
 * Enforce minimum role after requireAdminDb.
 */
export function requireMinRole(
    admin: ResolvedAdmin,
    minRole: AdminRole,
): NextResponse | null {
    if (!roleMeetsMinimumRank(admin.role, minRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
}

export function editorCanEditPricing(admin: ResolvedAdmin): boolean {
    return roleMeetsMinimumRank(admin.role, "manager");
}

export function editorCanEditInventory(admin: ResolvedAdmin): boolean {
    return roleMeetsMinimumRank(admin.role, "manager");
}
