import type {
    CreatePaymentSessionParams,
    PaymentSessionResult,
} from "@/lib/payments/types";

export function isSignapayPaymentReady(): boolean {
    return Boolean(
        process.env.SIGNAPAY_CLIENT_ID?.trim() &&
            process.env.SIGNAPAY_API_KEY?.trim() &&
            process.env.SIGNAPAY_REDIRECT_URI?.trim(),
    );
}

export async function createSignapayPaymentSession(
    _params: CreatePaymentSessionParams,
): Promise<PaymentSessionResult> {
    throw new Error(
        "The official SignaPay checkout flow is still required to launch real payments. Provide the merchant checkout/token flow docs or sandbox credentials to finish this adapter.",
    );
}
