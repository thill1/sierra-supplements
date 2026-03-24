import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
    checkRateLimitsMock,
    createCheckoutSessionMock,
    isStripeMockModeMock,
    logServerErrorMock,
} = vi.hoisted(() => ({
    checkRateLimitsMock: vi.fn(),
    createCheckoutSessionMock: vi.fn(),
    isStripeMockModeMock: vi.fn(),
    logServerErrorMock: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
    checkRateLimits: checkRateLimitsMock,
}));

vi.mock("@/lib/stripe/checkout", () => ({
    createCheckoutSession: createCheckoutSessionMock,
}));

vi.mock("@/lib/stripe/mock-mode", () => ({
    isStripeMockMode: isStripeMockModeMock,
}));

vi.mock("@/lib/observability", () => ({
    logServerError: logServerErrorMock,
}));

import { POST } from "@/app/api/checkout/session/route";

describe("POST /api/checkout/session", () => {
    const previousStripeSecret = process.env.STRIPE_SECRET_KEY;

    beforeEach(() => {
        process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
        checkRateLimitsMock.mockReset();
        createCheckoutSessionMock.mockReset();
        isStripeMockModeMock.mockReset();
        logServerErrorMock.mockReset();

        checkRateLimitsMock.mockReturnValue(null);
        isStripeMockModeMock.mockReturnValue(false);
    });

    afterEach(() => {
        process.env.STRIPE_SECRET_KEY = previousStripeSecret;
    });

    it("returns a generic validation error without zod details", async () => {
        const response = await POST(
            new Request("http://localhost/api/checkout/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{ productId: 0, variantId: 0, quantity: 0 }],
                }),
            }),
        );

        expect(response.status).toBe(400);
        const body = (await response.json()) as Record<string, unknown>;
        expect(body).toEqual({ error: "Invalid cart" });
    });

    it("does not expose raw provider errors to the client", async () => {
        createCheckoutSessionMock.mockRejectedValue(
            new Error("Gateway timeout from upstream secret details"),
        );

        const response = await POST(
            new Request("http://localhost/api/checkout/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{ productId: 1, variantId: 0, quantity: 1 }],
                    email: "buyer@example.com",
                }),
            }),
        );

        expect(response.status).toBe(400);
        const body = (await response.json()) as Record<string, unknown>;
        expect(body).toEqual({ error: "Checkout failed" });
        expect(logServerErrorMock).toHaveBeenCalledOnce();
    });
});
