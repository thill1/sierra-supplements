import {
    createSignapayPaymentSession,
    isSignapayPaymentReady,
} from "@/lib/payments/providers/signapay";
import {
    createStripePaymentSession,
    isStripePaymentReady,
} from "@/lib/payments/providers/stripe";
import type {
    CreatePaymentSessionParams,
    PaymentProvider,
    PaymentSessionResult,
} from "@/lib/payments/types";

export function resolvePaymentProvider(): PaymentProvider {
    return process.env.PAYMENT_PROVIDER === "signapay" ? "signapay" : "stripe";
}

export function isPaymentProviderReady(): boolean {
    switch (resolvePaymentProvider()) {
        case "stripe":
            return isStripePaymentReady();
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
        case "signapay":
            return createSignapayPaymentSession(params);
    }
}
