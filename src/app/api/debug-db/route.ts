import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const result = await pool.query("SELECT id, name, published FROM products LIMIT 5");
        await pool.end();
        return NextResponse.json({
            dbUrlPrefix: dbUrl.substring(0, 40) + "...",
            productCount: result.rowCount,
            products: result.rows,
        });
    } catch (e: unknown) {
        await pool.end();
        const errorMessage = e instanceof Error ? e.message : String(e);
        const errorStack = e instanceof Error ? e.stack : undefined;
        return NextResponse.json({ error: errorMessage, stack: errorStack, dbUrlPrefix: dbUrl.substring(0, 40) + "..." }, { status: 500 });
    }
}
