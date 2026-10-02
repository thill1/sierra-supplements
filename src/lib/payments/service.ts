import {
    createSignapayPaymentSession,
    isSignapayPaymentReady,
} from "@/lib/payments/providers/signapay";
import {
    createStripePaymentSession,
    isStripePaymentReady,
} from "@/lib/payments/providers/stripe";
import {
    createValorPaymentSession,
    isValorPaymentReady,
} from "@/lib/payments/providers/valor";
import type {
    CreatePaymentSessionParams,
    PaymentProvider,
    PaymentSessionResult,
} from "@/lib/payments/types";

export function resolvePaymentProvider(): PaymentProvider {
    if (process.env.PAYMENT_PROVIDER === "stripe") return "stripe";
    if (process.env.PAYMENT_PROVIDER === "signapay") return "signapay";
    return "valor";
}

export function isPaymentProviderReady(): boolean {
    switch (resolvePaymentProvider()) {
        case "stripe":
            return isStripePaymentReady();
        case "valor":
            return isValorPaymentReady();
        case "signapay":
            return isSignapayPaymentReady();
    }
}

export async function createPaymentSession(
    params: CreatePaymentSessionParams,
): Promise<PaymentSessionResult> {
    switch (resolvePaymentProvider()) {
        case "stripe":
            return createStripePaymentSession(params);
        case "valor":
            return createValorPaymentSession(params);
        case "signapay":
            return createSignapayPaymentSession(params);
    }
}
