import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { POST } from "@/app/api/webhooks/stripe/route";

describe("POST /api/webhooks/stripe", () => {
    const prevSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const prevKey = process.env.STRIPE_SECRET_KEY;
    const prevMock = process.env.STRIPE_MOCK_MODE;

    beforeEach(() => {
        delete process.env.STRIPE_MOCK_MODE;
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_unit_webhook_secret";
        process.env.STRIPE_SECRET_KEY = "sk_test_fake_key_for_unit_tests";
    });

    afterEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = prevSecret;
        process.env.STRIPE_SECRET_KEY = prevKey;
        process.env.STRIPE_MOCK_MODE = prevMock;
    });

    it("returns 400 when Stripe-Signature header is missing", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                body: "{}",
            }),
        );
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: string };
        expect(json.error).toMatch(/signature/i);
    });

    it("returns 400 when signature is invalid", async () => {
        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                headers: {
                    "stripe-signature": "t=0,v1=not_a_valid_signature",
                },
                body: "{}",
            }),
        );
        expect(res.status).toBe(400);
        const json = (await res.json()) as { error?: string };
        expect(json.error).toMatch(/invalid signature/i);
    });

    it("returns 503 when webhook is not configured", async () => {
        delete process.env.STRIPE_MOCK_MODE;
        delete process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.STRIPE_SECRET_KEY;

        const res = await POST(
            new Request("http://localhost/api/webhooks/stripe", {
                method: "POST",
                headers: { "stripe-signature": "t=1,v1=x" },
                body: "{}",
            }),
        );
        expect(res.status).toBe(503);
    });
});
