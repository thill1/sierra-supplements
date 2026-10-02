import type { CheckoutLineInput } from "@/lib/checkout/resolve-line-variant";

export type PaymentProvider = "stripe" | "valor" | "signapay";

export type CreatePaymentSessionParams = {
    items: CheckoutLineInput[];
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
};

export type PaymentSessionResult = {
    provider: PaymentProvider;
    url: string | null;
    externalSessionId: string | null;
};
