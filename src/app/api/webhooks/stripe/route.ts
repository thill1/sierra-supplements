import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, productVariants } from "@/db/schema";
import { applyStockChangeInTx } from "@/lib/inventory/adjust-stock";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logServerError } from "@/lib/observability";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";

export const runtime = "nodejs";

function parseItemsJson(raw: string | null | undefined): {
    productId: number;
    variantId: number;
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
                    const variantIdRaw = (row as { variantId?: unknown })
                        .variantId;
                    const variantId =
                        variantIdRaw !== undefined
                            ? Number(variantIdRaw)
                            : NaN;
                    if (
                        Number.isFinite(productId) &&
                        Number.isFinite(quantity) &&
                        quantity > 0 &&
                        Number.isFinite(variantId) &&
                        variantId > 0
                    ) {
                        return { productId, variantId, quantity };
                    }
                }
                return null;
            })
            .filter(Boolean) as {
            productId: number;
            variantId: number;
            quantity: number;
        }[];
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

        const variantIds = [...new Set(items.map((i) => i.variantId))];
        const variantRows = await db
            .select({
                variant: productVariants,
                product: products,
            })
            .from(productVariants)
            .innerJoin(products, eq(productVariants.productId, products.id))
            .where(inArray(productVariants.id, variantIds));

        const byVariantId = new Map(
            variantRows.map((r) => [r.variant.id, r]),
        );
        const slugByProductId = new Map(
            variantRows.map((r) => [r.product.id, r.product.slug]),
        );
        if (variantRows.length !== variantIds.length) {
            throw new Error("One or more variants are no longer available");
        }

        let subtotal = 0;
        const lines: {
            productId: number;
            variantId: number;
            name: string;
            sku: string | null;
            unitPrice: number;
            quantity: number;
            lineTotal: number;
        }[] = [];

        for (const line of items) {
            const row = byVariantId.get(line.variantId);
            if (!row) {
                throw new Error(`Missing variant ${line.variantId}`);
            }
            const { variant: v, product: p } = row;
            if (p.id !== line.productId) {
                throw new Error("Line product/variant mismatch");
            }
            const displayName = `${p.name} — ${v.label}`;
            const lineTotal = v.price * line.quantity;
            subtotal += lineTotal;
            lines.push({
                productId: p.id,
                variantId: v.id,
                name: displayName,
                sku: v.sku ?? null,
                unitPrice: v.price,
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
                            slug: slugByProductId.get(l.productId) ?? null,
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
                    variantId: l.variantId,
                    productName: l.name,
                    sku: l.sku,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                    lineTotal: l.lineTotal,
                });

                await applyStockChangeInTx(tx, {
                    variantId: l.variantId,
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
