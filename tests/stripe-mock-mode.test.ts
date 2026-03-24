import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";

describe("Stripe mock mode (STRIPE_MOCK_MODE)", () => {
    const prevMock = process.env.STRIPE_MOCK_MODE;
    const prevSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const prevKey = process.env.STRIPE_SECRET_KEY;
    const prevNodeEnv = process.env.NODE_ENV;
    const prevVercel = process.env.VERCEL;

    beforeEach(() => {
        process.env.NODE_ENV = "test";
        delete process.env.VERCEL;
        process.env.STRIPE_MOCK_MODE = "true";
        delete process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.STRIPE_SECRET_KEY;
    });

    afterEach(() => {
        process.env.STRIPE_MOCK_MODE = prevMock;
        process.env.STRIPE_WEBHOOK_SECRET = prevSecret;
        process.env.STRIPE_SECRET_KEY = prevKey;
        process.env.NODE_ENV = prevNodeEnv;
        process.env.VERCEL = prevVercel;
    });

    it("is disabled on production deployments even if the env flag is set", async () => {
        process.env.NODE_ENV = "production";
        process.env.VERCEL = "1";

        const { isStripeMockMode } = await import("@/lib/stripe/mock-mode");
        expect(isStripeMockMode()).toBe(false);
    });

    it("returns 400 for non-JSON body", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                body: "not-json",
            }),
        );
        expect(res.status).toBe(400);
    });

    it("acknowledges unrelated event types without Stripe SDK", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "customer.created", data: {} }),
            }),
        );
        expect(res.status).toBe(200);
        const json = (await res.json()) as { received?: boolean };
        expect(json.received).toBe(true);
    });

    it("returns 400 when checkout.session.completed lacks session id", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "checkout.session.completed",
                    data: { object: {} },
                }),
            }),
        );
        expect(res.status).toBe(400);
    });

    it("accepts completed session with no line items (no DB work)", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "checkout.session.completed",
                    data: {
                        object: {
                            id: "cs_mock_no_items",
                            metadata: {},
                        },
                    },
                }),
            }),
        );
        expect(res.status).toBe(200);
    });
});
