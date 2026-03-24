import type { CheckoutLineInput } from "@/lib/checkout/resolve-line-variant";

export type PaymentProvider = "stripe" | "signapay";

export type CreatePaymentSessionParams = {
    items: CheckoutLineInput[];
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
};

export type PaymentSessionResult = {
    provider: PaymentProvider;
    url: string | null;
    externalSessionId: string | null;
};
