import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cal.com: HMAC-SHA256 of the raw body with the webhook secret; compare to
 * `x-cal-signature-256` (hex digest). See Cal.com webhook docs.
 */
export function verifyCalWebhookSignature(
    rawBody: string,
    secret: string,
    signatureHeader: string | null,
): boolean {
    if (!secret || !signatureHeader) return false;
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const received = signatureHeader.trim();
    try {
        const a = Buffer.from(expected, "utf8");
        const b = Buffer.from(received, "utf8");
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}
