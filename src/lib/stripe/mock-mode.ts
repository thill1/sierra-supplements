/**
 * When true, card checkout skips the Stripe API (synthetic session + redirect URL)
 * and the webhook accepts a JSON event body without signature verification.
 * Do not enable on a public production host unless you understand the risk.
 */
export function isStripeMockMode(): boolean {
    const v = process.env.STRIPE_MOCK_MODE?.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
}
