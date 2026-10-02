import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
    createStripePaymentSessionMock,
    isStripePaymentReadyMock,
    createValorPaymentSessionMock,
    isValorPaymentReadyMock,
} = vi.hoisted(() => ({
    createStripePaymentSessionMock: vi.fn(),
    isStripePaymentReadyMock: vi.fn(() => true),
    createValorPaymentSessionMock: vi.fn(),
    isValorPaymentReadyMock: vi.fn(() => true),
}));

vi.mock("@/lib/payments/providers/stripe", () => ({
    createStripePaymentSession: createStripePaymentSessionMock,
    isStripePaymentReady: isStripePaymentReadyMock,
}));

vi.mock("@/lib/payments/providers/valor", () => ({
    createValorPaymentSession: createValorPaymentSessionMock,
    isValorPaymentReady: isValorPaymentReadyMock,
}));

describe("payment service", () => {
    const envSnapshot = {
        PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    };

    beforeEach(() => {
        vi.resetModules();
        createStripePaymentSessionMock.mockReset();
        isStripePaymentReadyMock.mockReset();
        isStripePaymentReadyMock.mockReturnValue(true);
        createValorPaymentSessionMock.mockReset();
        isValorPaymentReadyMock.mockReset();
        isValorPaymentReadyMock.mockReturnValue(true);
        delete process.env.PAYMENT_PROVIDER;
    });

    afterEach(() => {
        process.env.PAYMENT_PROVIDER = envSnapshot.PAYMENT_PROVIDER;
    });

    it("defaults to Valor when no provider is configured", async () => {
        const { resolvePaymentProvider } = await import("@/lib/payments/service");

        expect(resolvePaymentProvider()).toBe("valor");
    });

    it("delegates card checkout creation to the active provider", async () => {
        createValorPaymentSessionMock.mockResolvedValue({
            provider: "valor",
            url: "https://checkout.example.com",
            externalSessionId: "valor_123",
        });

        const { createPaymentSession } = await import("@/lib/payments/service");
        const params = {
            items: [{ productId: 1, variantId: 0, quantity: 1 }],
            successUrl: "https://example.com/store/thank-you",
            cancelUrl: "https://example.com/store/cart",
            customerEmail: "buyer@example.com",
            customerName: "Buyer",
            customerPhone: "555-0100",
        };

        const result = await createPaymentSession(params);

        expect(createValorPaymentSessionMock).toHaveBeenCalledWith(params);
        expect(result).toEqual({
            provider: "valor",
            url: "https://checkout.example.com",
            externalSessionId: "valor_123",
        });
    });

    it("still supports the legacy Stripe provider when explicitly selected", async () => {
        process.env.PAYMENT_PROVIDER = "stripe";
        createStripePaymentSessionMock.mockResolvedValue({
            provider: "stripe",
            url: "https://checkout.stripe.example.com",
            externalSessionId: "cs_123",
        });

        const { createPaymentSession, resolvePaymentProvider } = await import(
            "@/lib/payments/service"
        );

        expect(resolvePaymentProvider()).toBe("stripe");
        await createPaymentSession({
            items: [{ productId: 1, variantId: 0, quantity: 1 }],
            successUrl: "https://example.com/store/thank-you",
            cancelUrl: "https://example.com/store/cart",
        });
        expect(createStripePaymentSessionMock).toHaveBeenCalledOnce();
    });

    it("fails safely when SignaPay is selected without a configured adapter flow", async () => {
        process.env.PAYMENT_PROVIDER = "signapay";

        const { createPaymentSession, isPaymentProviderReady } = await import(
            "@/lib/payments/service"
        );

        expect(isPaymentProviderReady()).toBe(false);
        await expect(
            createPaymentSession({
                items: [{ productId: 1, variantId: 0, quantity: 1 }],
                successUrl: "https://example.com/store/thank-you",
                cancelUrl: "https://example.com/store/cart",
            }),
        ).rejects.toThrow(/SignaPay/);
    });
});
