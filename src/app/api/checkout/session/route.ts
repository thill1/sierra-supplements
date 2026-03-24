import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { createPaymentSession, isPaymentProviderReady } from "@/lib/payments/service";
import { checkRateLimits } from "@/lib/rate-limit";
import { logServerError } from "@/lib/observability";

const bodySchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.number().int().positive(),
                variantId: z.number().int().nonnegative(),
                slug: z.string().min(1).max(200).optional(),
                quantity: z.number().int().positive().max(99),
            }),
        )
        .min(1)
        .max(50),
    email: z.string().email().optional(),
});

export async function POST(request: Request) {
    const limited = await checkRateLimits(request, [
        { namespace: "checkout-15m", limit: 10, windowMs: 15 * 60 * 1000 },
    ]);
    if (limited) return limited;

    if (!isPaymentProviderReady()) {
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

        const session = await createPaymentSession({
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
            return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
        }
        logServerError("checkout_session", error);
        return NextResponse.json({ error: "Checkout failed" }, { status: 400 });
    }
}
