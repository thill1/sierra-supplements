import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Liveness + basic DB connectivity for load balancers and ops.
 * Returns 200 even if the database is down (`database: false`) so the app can still serve static pages.
 */
export async function GET() {
    let database = false;
    try {
        const { db } = await import("@/db");
        await db.execute(sql`SELECT 1`);
        database = true;
    } catch {
        database = false;
    }

    return NextResponse.json(
        {
            ok: true,
            database,
            timestamp: new Date().toISOString(),
        },
        {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}
