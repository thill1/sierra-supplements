import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { applyStockChangeInTx } from "@/lib/inventory/adjust-stock";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logServerError } from "@/lib/observability";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";

export const runtime = "nodejs";

function parseItemsJson(raw: string | null | undefined): {
    productId: number;
    quantity: number;
}[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((row) => {
                if (
                    row &&
                    typeof row === "object" &&
                    "productId" in row &&
                    "quantity" in row
                ) {
                    const productId = Number(
                        (row as { productId: unknown }).productId,
                    );
                    const quantity = Number(
                        (row as { quantity: unknown }).quantity,
                    );
                    if (
                        Number.isFinite(productId) &&
                        Number.isFinite(quantity) &&
                        quantity > 0
                    ) {
                        return { productId, quantity };
                    }
                }
                return null;
            })
            .filter(Boolean) as { productId: number; quantity: number }[];
    } catch {
        return [];
    }
}

async function fulfillCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
): Promise<NextResponse> {
    const sessionId = session.id;

    const items = parseItemsJson(session.metadata?.items_json);
    if (items.length === 0) {
        if (!isStripeMockMode()) {
            logServerError("stripe_webhook_no_items", new Error(sessionId));
        }
        return NextResponse.json({ received: true });
    }

    try {
        const [existing] = await db
            .select({ id: orders.id })
            .from(orders)
            .where(eq(orders.stripeCheckoutSessionId, sessionId))
            .limit(1);
        if (existing) {
            return NextResponse.json({ received: true, duplicate: true });
        }

        const email =
            session.customer_details?.email ||
            session.customer_email ||
            "unknown@customer.local";
        const name = session.customer_details?.name ?? null;

        const productIds = [...new Set(items.map((i) => i.productId))];
        const catalog = await db
            .select()
            .from(products)
            .where(inArray(products.id, productIds));
        const byId = new Map(catalog.map((p) => [p.id, p]));
        if (catalog.length !== productIds.length) {
            throw new Error("One or more products are no longer available");
        }

        let subtotal = 0;
        const lines: {
            productId: number;
            name: string;
            sku: string | null;
            unitPrice: number;
            quantity: number;
            lineTotal: number;
        }[] = [];

        for (const line of items) {
            const p = byId.get(line.productId);
            if (!p) {
                throw new Error(`Missing product ${line.productId}`);
            }
            const lineTotal = p.price * line.quantity;
            subtotal += lineTotal;
            lines.push({
                productId: p.id,
                name: p.name,
                sku: p.sku ?? null,
                unitPrice: p.price,
                quantity: line.quantity,
                lineTotal,
            });
        }

        await db.transaction(async (tx) => {
            const [order] = await tx
                .insert(orders)
                .values({
                    email,
                    name,
                    phone: session.customer_details?.phone ?? null,
                    addressLine1:
                        session.customer_details?.address?.line1 ?? null,
                    addressLine2:
                        session.customer_details?.address?.line2 ?? null,
                    city: session.customer_details?.address?.city ?? null,
                    state: session.customer_details?.address?.state ?? null,
                    zip: session.customer_details?.address?.postal_code ?? null,
                    items: JSON.stringify(
                        lines.map((l) => ({
                            slug: byId.get(l.productId)?.slug,
                            name: l.name,
                            price: l.unitPrice,
                            quantity: l.quantity,
                        })),
                    ),
                    subtotal,
                    autoPay: false,
                    notes: null,
                    status: "paid",
                    stripeCheckoutSessionId: sessionId,
                })
                .returning();

            if (!order) throw new Error("Order insert failed");

            for (const l of lines) {
                await tx.insert(orderItems).values({
                    orderId: order.id,
                    productId: l.productId,
                    productName: l.name,
                    sku: l.sku,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                    lineTotal: l.lineTotal,
                });

                await applyStockChangeInTx(tx, {
                    productId: l.productId,
                    delta: -l.quantity,
                    reason: "stripe_checkout",
                    source: INVENTORY_SOURCE.webSale,
                    note: `session ${sessionId}`,
                    actorUserId: null,
                });
            }

            await writeAuditLog(tx, {
                actorUserId: null,
                entityType: "order",
                entityId: String(order.id),
                action: "stripe_checkout_completed",
                after: { sessionId, subtotal },
            });
        });

        return NextResponse.json({ received: true });
    } catch (e) {
        logServerError("stripe_webhook_fulfill", e);
        return NextResponse.json(
            { error: "Fulfillment failed" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const body = await request.text();

    if (isStripeMockMode()) {
        let event: Stripe.Event;
        try {
            event = JSON.parse(body) as Stripe.Event;
        } catch {
            return NextResponse.json(
                { error: "STRIPE_MOCK_MODE expects a JSON event body" },
                { status: 400 },
            );
        }
        if (!event?.type) {
            return NextResponse.json({ error: "Invalid event" }, { status: 400 });
        }
        if (event.type !== "checkout.session.completed") {
            return NextResponse.json({ received: true });
        }
        const session = event.data?.object as Stripe.Checkout.Session | undefined;
        if (!session?.id) {
            return NextResponse.json(
                { error: "Missing checkout session" },
                { status: 400 },
            );
        }
        return fulfillCheckoutSessionCompleted(session);
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret || !key) {
        return NextResponse.json(
            { error: "Stripe webhook not configured" },
            { status: 503 },
        );
    }

    const sig = request.headers.get("stripe-signature");
    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = new Stripe(key);
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, secret);
    } catch (e) {
        logServerError("stripe_webhook_signature", e);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type !== "checkout.session.completed") {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    return fulfillCheckoutSessionCompleted(session);
}
