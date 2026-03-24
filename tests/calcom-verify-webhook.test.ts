import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyCalWebhookSignature } from "@/lib/calcom/verify-webhook";

describe("verifyCalWebhookSignature", () => {
    const secret = "test-secret";
    const body = '{"triggerEvent":"BOOKING_CREATED","payload":{}}';

    it("accepts a valid hex HMAC-SHA256 of the raw body", () => {
        const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
        expect(verifyCalWebhookSignature(body, secret, sig)).toBe(true);
    });

    it("rejects wrong secret", () => {
        const sig = createHmac("sha256", secret).update(body, "utf8").digest("hex");
        expect(verifyCalWebhookSignature(body, "other", sig)).toBe(false);
    });

    it("rejects missing or invalid signature header", () => {
        expect(verifyCalWebhookSignature(body, secret, null)).toBe(false);
        expect(verifyCalWebhookSignature(body, secret, "not-hex")).toBe(false);
    });
});
