import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");

        const conditions = [eq(products.published, true)];
        if (category) conditions.push(eq(products.category, category));
        if (featured === "true") conditions.push(eq(products.featured, true));

        const result = await db
            .select()
            .from(products)
            .where(and(...conditions))
            .orderBy(desc(products.featured), desc(products.createdAt));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Products fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
