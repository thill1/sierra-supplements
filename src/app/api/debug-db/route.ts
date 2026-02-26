import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const allProducts = await db.select().from(products);
        return NextResponse.json({
            dbUrlSet: !!dbUrl,
            dbUrlPrefix: dbUrl ? dbUrl.substring(0, 40) + "..." : null,
            productCount: allProducts.length,
            products: allProducts.map((p) => ({ id: p.id, name: p.name, published: p.published })),
        });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        const errorStack = e instanceof Error ? e.stack : undefined;
        return NextResponse.json({ error: errorMessage, stack: errorStack }, { status: 500 });
    }
}
