import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("SignaPay provider", () => {
    const envSnapshot = {
        SIGNAPAY_CLIENT_ID: process.env.SIGNAPAY_CLIENT_ID,
        SIGNAPAY_API_KEY: process.env.SIGNAPAY_API_KEY,
        SIGNAPAY_REDIRECT_URI: process.env.SIGNAPAY_REDIRECT_URI,
    };

    beforeEach(() => {
        delete process.env.SIGNAPAY_CLIENT_ID;
        delete process.env.SIGNAPAY_API_KEY;
        delete process.env.SIGNAPAY_REDIRECT_URI;
    });

    afterEach(() => {
        process.env.SIGNAPAY_CLIENT_ID = envSnapshot.SIGNAPAY_CLIENT_ID;
        process.env.SIGNAPAY_API_KEY = envSnapshot.SIGNAPAY_API_KEY;
        process.env.SIGNAPAY_REDIRECT_URI = envSnapshot.SIGNAPAY_REDIRECT_URI;
    });

    it("reports not ready when required SignaPay env vars are missing", async () => {
        const { isSignapayPaymentReady } = await import(
            "@/lib/payments/providers/signapay"
        );

        expect(isSignapayPaymentReady()).toBe(false);
    });

    it("throws a clear error until the official SignaPay checkout flow is implemented", async () => {
        process.env.SIGNAPAY_CLIENT_ID = "client";
        process.env.SIGNAPAY_API_KEY = "api-key";
        process.env.SIGNAPAY_REDIRECT_URI = "https://example.com/store/thank-you";

        const { createSignapayPaymentSession } = await import(
            "@/lib/payments/providers/signapay"
        );

        await expect(
            createSignapayPaymentSession({
                items: [{ productId: 1, variantId: 0, quantity: 1 }],
                successUrl: "https://example.com/store/thank-you",
                cancelUrl: "https://example.com/store/cart",
            }),
        ).rejects.toThrow(/official SignaPay checkout flow/i);
    });
});
