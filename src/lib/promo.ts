/** First-order promo: valid once per customer; apply at checkout. */
export const EXIT_INTENT_DISCOUNT_CODE = "Sierra2026";
export const EXIT_INTENT_DISCOUNT_PERCENT = 15;

const FIRST_ORDER_DISCOUNT_LEAD_SOURCES = new Set([
    "exit_intent",
    "lead_magnet_banner",
    "lead_magnet_page",
]);

export function isFirstOrderDiscountLeadSource(
    source: string | undefined
): boolean {
    return source != null && FIRST_ORDER_DISCOUNT_LEAD_SOURCES.has(source);
}
