import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { requireAdminDb, type ResolvedAdmin } from "@/lib/admin-auth";

export type RequireAdminResult =
    | { session: Session; admin: ResolvedAdmin; response: null }
    | { session: null; admin: null; response: NextResponse };

/** Narrowed admin/session for route handlers (use after checking `instanceof NextResponse`). */
export function requireAdminOrRespond(
    result: RequireAdminResult,
):
    | NextResponse
    | { admin: ResolvedAdmin; session: Session } {
    if (result.admin == null) {
        return (
            result.response ??
            NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
    }
    return { admin: result.admin, session: result.session };
}

/**
 * Require an authenticated admin (admin_users row or bootstrap env allowlist).
 * Use on all /api/admin/* handlers that perform mutations or sensitive reads.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
    const session = await auth();
    const { admin, response } = await requireAdminDb(session);
    if (response || !session || !admin) {
        return {
            session: null,
            admin: null,
            response:
                response ??
                NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { session, admin, response: null };
}
