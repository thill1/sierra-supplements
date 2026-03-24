import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { checkRateLimits } from "@/lib/rate-limit";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";
import { logServerError } from "@/lib/observability";

const bodySchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.number().int().positive(),
                quantity: z.number().int().positive().max(99),
            }),
        )
        .min(1)
        .max(50),
    email: z.string().email().optional(),
});

export async function POST(request: Request) {
    const limited = checkRateLimits(request, [
        { namespace: "checkout-15m", limit: 10, windowMs: 15 * 60 * 1000 },
    ]);
    if (limited) return limited;

    const stripeReady =
        isStripeMockMode() || process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeReady) {
        return NextResponse.json(
            { error: "Online card checkout is not enabled yet." },
            { status: 503 },
        );
    }

    try {
        const json = await request.json();
        const data = bodySchema.parse(json);

        const base =
            process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
            new URL(request.url).origin;

        const session = await createCheckoutSession({
            items: data.items,
            successUrl: `${base}/store/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${base}/store/cart`,
            customerEmail: data.email,
        });

        if (!session.url) {
            return NextResponse.json(
                { error: "Could not start checkout" },
                { status: 500 },
            );
        }

        return NextResponse.json({ url: session.url });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid cart", details: error.issues },
                { status: 400 },
            );
        }
        logServerError("checkout_session", error);
        const message =
            error instanceof Error ? error.message : "Checkout failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
