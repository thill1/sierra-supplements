import { randomBytes } from "node:crypto";
import Stripe from "stripe";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";
import {
  resolveLineToVariantIds,
  type CheckoutLineInput,
} from "@/lib/checkout/resolve-line-variant";

/** After server resolution; stored in Stripe metadata and used by webhooks. */
export type ResolvedCheckoutLine = {
  productId: number;
  variantId: number;
  quantity: number;
};

export type CreateCheckoutSessionParams = {
  items: CheckoutLineInput[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

async function buildStripeLineItems(
  resolved: ResolvedCheckoutLine[],
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  if (resolved.length === 0) {
    throw new Error("Cart is empty");
  }

  const variantIds = [
    ...new Set(resolved.map((i) => i.variantId).filter((id) => id > 0)),
  ];

  const rows =
    variantIds.length > 0
      ? await db
          .select({
            variant: productVariants,
            product: products,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(inArray(productVariants.id, variantIds))
      : [];

  const byVariantId = new Map(rows.map((r) => [r.variant.id, r]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of resolved) {
    if (line.variantId > 0) {
      const row = byVariantId.get(line.variantId);
      if (!row) {
        throw new Error(`Unknown variant id ${line.variantId}`);
      }
      const { variant: v, product: p } = row;
      if (
        !p.published ||
        p.status !== "active" ||
        v.stockQuantity < line.quantity
      ) {
        throw new Error(`Product unavailable: ${p.name} — ${v.label}`);
      }

      const displayName = `${p.name} — ${v.label}`;

      if (v.stripePriceId) {
        lineItems.push({
          price: v.stripePriceId,
          quantity: line.quantity,
        });
      } else {
        lineItems.push({
          quantity: line.quantity,
          price_data: {
            currency: "usd",
            unit_amount: v.price,
            product_data: {
              name: displayName,
              metadata: {
                product_id: String(p.id),
                variant_id: String(v.id),
              },
            },
          },
        });
      }
      continue;
    }

    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, line.productId))
      .limit(1);

    if (!p) {
      throw new Error(`Unknown product id ${line.productId}`);
    }
    if (
      !p.published ||
      p.status !== "active" ||
      p.stockQuantity < line.quantity
    ) {
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
            metadata: {
              product_id: String(p.id),
              variant_id: "0",
            },
          },
        },
      });
    }
  }

  return lineItems;
}

/**
 * Build a Stripe Checkout session from DB-backed catalog (prices never from the client alone).
 * With `STRIPE_MOCK_MODE`, returns a synthetic session and does not call Stripe.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const resolved: ResolvedCheckoutLine[] = [];
  for (const line of params.items) {
    const { productId, variantId } = await resolveLineToVariantIds(line);
    resolved.push({
      productId,
      variantId,
      quantity: line.quantity,
    });
  }

  const lineItems = await buildStripeLineItems(resolved);

  if (isStripeMockMode()) {
    const sessionId = `cs_mock_${randomBytes(12).toString("hex")}`;
    const url = params.successUrl.replace("{CHECKOUT_SESSION_ID}", sessionId);
    return {
      id: sessionId,
      object: "checkout.session",
      url,
      metadata: {
        items_json: JSON.stringify(resolved),
      },
      customer_email: params.customerEmail ?? null,
      customer_details: params.customerEmail
        ? { email: params.customerEmail, name: null }
        : undefined,
    } as unknown as Stripe.Checkout.Session;
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const stripe = new Stripe(secret);

  const payload: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: lineItems,
    metadata: {
      items_json: JSON.stringify(resolved),
    },
    ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
  };

  return stripe.checkout.sessions.create(payload);
}
