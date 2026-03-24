import { createCheckoutSession } from "@/lib/stripe/checkout";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";
import type {
    CreatePaymentSessionParams,
    PaymentSessionResult,
} from "@/lib/payments/types";

export function isStripePaymentReady(): boolean {
    return isStripeMockMode() || Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function createStripePaymentSession(
    params: CreatePaymentSessionParams,
): Promise<PaymentSessionResult> {
    const session = await createCheckoutSession(params);
    return {
        provider: "stripe",
        url: session.url ?? null,
        externalSessionId: session.id ?? null,
    };
}
