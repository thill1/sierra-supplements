import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin-allowlist";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { logAdminAuthzFailure } from "@/lib/observability";

export type RequireAdminResult =
    | { session: Session; response: null }
    | { session: null; response: NextResponse };

/**
 * Require an authenticated admin (ADMIN_EMAILS allowlist). Use on all /api/admin/* handlers.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
    const session = await auth();
    const email = session?.user?.email;

    if (!session?.user || !email) {
        return {
            session: null,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const allowed = session.user.isAdmin === true && isUserAdmin(email);
    if (!allowed) {
        logAdminAuthzFailure("require_admin", email);
        return {
            session: null,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }

    return { session, response: null };
}
