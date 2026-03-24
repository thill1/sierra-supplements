import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createStripePaymentSessionMock, isStripePaymentReadyMock } = vi.hoisted(() => ({
    createStripePaymentSessionMock: vi.fn(),
    isStripePaymentReadyMock: vi.fn(() => true),
}));

vi.mock("@/lib/payments/providers/stripe", () => ({
    createStripePaymentSession: createStripePaymentSessionMock,
    isStripePaymentReady: isStripePaymentReadyMock,
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
        delete process.env.PAYMENT_PROVIDER;
    });

    afterEach(() => {
        process.env.PAYMENT_PROVIDER = envSnapshot.PAYMENT_PROVIDER;
    });

    it("defaults to Stripe when no provider is configured", async () => {
        const { resolvePaymentProvider } = await import("@/lib/payments/service");

        expect(resolvePaymentProvider()).toBe("stripe");
    });

    it("delegates card checkout creation to the active provider", async () => {
        createStripePaymentSessionMock.mockResolvedValue({
            provider: "stripe",
            url: "https://checkout.example.com",
            externalSessionId: "cs_123",
        });

        const { createPaymentSession } = await import("@/lib/payments/service");
        const params = {
            items: [{ productId: 1, variantId: 0, quantity: 1 }],
            successUrl: "https://example.com/store/thank-you",
            cancelUrl: "https://example.com/store/cart",
            customerEmail: "buyer@example.com",
        };

        const result = await createPaymentSession(params);

        expect(createStripePaymentSessionMock).toHaveBeenCalledWith(params);
        expect(result).toEqual({
            provider: "stripe",
            url: "https://checkout.example.com",
            externalSessionId: "cs_123",
        });
    });
});
