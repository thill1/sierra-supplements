import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Require authentication for API routes. Returns session or 401 response.
 */
export async function requireAuth() {
    const session = await auth();
    if (!session?.user) {
        return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { session, response: null };
}
