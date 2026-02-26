import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
    const envInfo = {
        has_DATABASE_URL: !!process.env.DATABASE_URL,
        has_POSTGRES_URL: !!process.env.POSTGRES_URL,
        has_POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    };

    const dbUrl =
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.POSTGRES_URL;

    if (!dbUrl) {
        return NextResponse.json({ error: "No DB URL found", envInfo }, { status: 500 });
    }

    // Strip sslmode param (we handle SSL via pool options)
    const cleanUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");

    const pool = new Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const result = await pool.query("SELECT id, name, published FROM products LIMIT 5");
        await pool.end();
        return NextResponse.json({
            envInfo,
            dbUrlPrefix: cleanUrl.substring(0, 50) + "...",
            productCount: result.rowCount,
            products: result.rows,
        });
    } catch (e: unknown) {
        try { await pool.end(); } catch { }
        const errorMessage = e instanceof Error ? e.message : String(e);
        return NextResponse.json({
            error: errorMessage,
            envInfo,
            dbUrlPrefix: cleanUrl.substring(0, 50) + "...",
        }, { status: 500 });
    }
}
