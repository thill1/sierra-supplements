import { NextResponse } from "next/server";
import Stripe from "stripe";
import { logServerError } from "@/lib/observability";
import { settleCompletedPayment } from "@/lib/payments/settlement";
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
          const productId = Number((row as { productId: unknown }).productId);
          const quantity = Number((row as { quantity: unknown }).quantity);
          const variantIdRaw = (row as { variantId?: unknown }).variantId;
          const variantId =
            variantIdRaw !== undefined ? Number(variantIdRaw) : 0;
          if (
            Number.isFinite(productId) &&
            Number.isFinite(quantity) &&
            quantity > 0 &&
            Number.isFinite(variantId) &&
            variantId >= 0
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
  const items = parseItemsJson(session.metadata?.items_json);
  if (items.length === 0) {
    if (!isStripeMockMode()) {
      logServerError("stripe_webhook_no_items", new Error(session.id));
    }
    return NextResponse.json({ received: true });
  }

  return settleCompletedPayment({
    provider: "stripe",
    externalSessionId: session.id,
    customer: {
      email:
        session.customer_details?.email ||
        session.customer_email ||
        "unknown@customer.local",
      name: session.customer_details?.name ?? null,
      phone: session.customer_details?.phone ?? null,
      addressLine1: session.customer_details?.address?.line1 ?? null,
      addressLine2: session.customer_details?.address?.line2 ?? null,
      city: session.customer_details?.address?.city ?? null,
      state: session.customer_details?.address?.state ?? null,
      zip: session.customer_details?.address?.postal_code ?? null,
    },
    items,
  });
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
