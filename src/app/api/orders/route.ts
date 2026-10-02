import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { inArray } from "drizzle-orm";
import { checkRateLimits } from "@/lib/rate-limit";
import { logServerError } from "@/lib/observability";
import { sendOfflineOrderEmails } from "@/lib/email/order-emails";

/**
 * Legacy order-intake endpoint (email + shipping + pay-offline flow).
 * Does not decrement inventory — stock is reserved/reduced only when payment
 * is confirmed (Stripe webhook) or via admin in-store sale / restock tools.
 */

const orderItemSchema = z.object({
    slug: z.string().min(1).max(200),
    quantity: z.number().int().positive().max(99),
});

const orderSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(200),
    phone: z.string().max(50).optional(),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(50),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP format"),
    items: z.array(orderItemSchema).min(1).max(50),
    autoPay: z.boolean().optional(),
    notes: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
    const limited = await checkRateLimits(request, [
        { namespace: "orders-15m", limit: 3, windowMs: 15 * 60 * 1000 },
        { namespace: "orders-1h", limit: 8, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    try {
        const body = await request.json();
        const parsed = orderSchema.parse(body);

        let db: typeof import("@/db").db;
        let ordersTable: typeof import("@/db/schema").orders;
        let productsTable: typeof import("@/db/schema").products;
        try {
            const dbMod = await import("@/db");
            const schemaMod = await import("@/db/schema");
            db = dbMod.db;
            ordersTable = schemaMod.orders;
            productsTable = schemaMod.products;
        } catch (e) {
            logServerError("orders_db_import", e);
            return NextResponse.json(
                { error: "Service temporarily unavailable" },
                { status: 503 },
            );
        }

        const slugs = [...new Set(parsed.items.map((i) => i.slug))];
        let dbProducts: {
            slug: string;
            name: string;
            price: number;
            stockQuantity: number;
        }[];
        try {
            dbProducts = await db
                .select({
                    slug: productsTable.slug,
                    name: productsTable.name,
                    price: productsTable.price,
                    stockQuantity: productsTable.stockQuantity,
                })
                .from(productsTable)
                .where(inArray(productsTable.slug, slugs));
        } catch (e) {
            logServerError("orders_db_products", e);
            return NextResponse.json(
                { error: "Service temporarily unavailable" },
                { status: 503 },
            );
        }

        const productMap = new Map(dbProducts.map((p) => [p.slug, p]));

        const validatedItems: { slug: string; name: string; price: number; quantity: number }[] = [];
        let subtotal = 0;

        for (const item of parsed.items) {
            const product = productMap.get(item.slug);
            if (!product) {
                return NextResponse.json(
                    { error: "Invalid product", slug: item.slug },
                    { status: 400 }
                );
            }
            if (product.stockQuantity < item.quantity) {
                return NextResponse.json(
                    {
                        error: "Not enough stock for this order",
                        slug: item.slug,
                    },
                    { status: 400 },
                );
            }
            const lineTotal = product.price * item.quantity;
            subtotal += lineTotal;
            validatedItems.push({
                slug: product.slug,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        const autoPay = !!parsed.autoPay;
        const finalSubtotal = autoPay ? Math.round(subtotal * 0.9) : subtotal;

        let orderId: number | null = null;
        try {
            const [order] = await db
                .insert(ordersTable)
                .values({
                    email: parsed.email,
                    name: parsed.name,
                    phone: parsed.phone ?? null,
                    addressLine1: parsed.addressLine1,
                    addressLine2: parsed.addressLine2 ?? null,
                    city: parsed.city,
                    state: parsed.state,
                    zip: parsed.zip,
                    items: JSON.stringify(validatedItems),
                    subtotal: finalSubtotal,
                    autoPay,
                    notes: parsed.notes ?? null,
                })
                .returning({ id: ordersTable.id });

            orderId = order?.id ?? null;
        } catch (e) {
            logServerError("orders_db_insert", e);
            return NextResponse.json(
                { error: "Service temporarily unavailable" },
                { status: 503 },
            );
        }

        if (orderId === null) {
            return NextResponse.json(
                { error: "Service temporarily unavailable" },
                { status: 503 },
            );
        }

        await sendOfflineOrderEmails({
            id: orderId,
            email: parsed.email,
            name: parsed.name,
            phone: parsed.phone ?? null,
            addressLine1: parsed.addressLine1,
            addressLine2: parsed.addressLine2 ?? null,
            city: parsed.city,
            state: parsed.state,
            zip: parsed.zip,
            subtotal: finalSubtotal,
            notes: parsed.notes ?? null,
            autoPay,
            lines: validatedItems,
        });

        return NextResponse.json({ success: true, orderId }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        logServerError("orders_post", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
