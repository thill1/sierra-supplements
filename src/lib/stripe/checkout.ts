import Stripe from "stripe";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export type CheckoutLineInput = { productId: number; quantity: number };

export type CreateCheckoutSessionParams = {
    items: CheckoutLineInput[];
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
};

/**
 * Build a Stripe Checkout session from DB-backed catalog (prices never from the client alone).
 */
export async function createCheckoutSession(
    params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(secret);

    const ids = [...new Set(params.items.map((i) => i.productId))];
    if (ids.length === 0) {
        throw new Error("Cart is empty");
    }

    const rows = await db
        .select()
        .from(products)
        .where(inArray(products.id, ids));

    const byId = new Map(rows.map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const line of params.items) {
        const p = byId.get(line.productId);
        if (!p) {
            throw new Error(`Unknown product id ${line.productId}`);
        }
        if (!p.published || p.status !== "active" || p.stockQuantity < line.quantity) {
            throw new Error(`Product unavailable: ${p.name}`);
        }

        if (p.stripePriceId) {
            lineItems.push({
                price: p.stripePriceId,
                quantity: line.quantity,
            });
        } else {
            lineItems.push({
                quantity: line.quantity,
                price_data: {
                    currency: "usd",
                    unit_amount: p.price,
                    product_data: {
                        name: p.name,
                        metadata: { product_id: String(p.id) },
                    },
                },
            });
        }
    }

    const payload: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        line_items: lineItems,
        metadata: {
            items_json: JSON.stringify(params.items),
        },
        ...(params.customerEmail
            ? { customer_email: params.customerEmail }
            : {}),
    };

    return stripe.checkout.sessions.create(payload);
}
