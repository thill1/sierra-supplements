/** Free shipping threshold in cents */
export const FREE_SHIPPING_THRESHOLD_CENTS = 8000; // $80

/** Auto-pay discount (10%) */
export const AUTO_PAY_DISCOUNT_RATE = 0.1;

export function applyAutoPayDiscount(subtotalCents: number): number {
    return Math.round(subtotalCents * (1 - AUTO_PAY_DISCOUNT_RATE));
}

export function qualifiesForFreeShipping(subtotalCents: number): boolean {
    return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
}

export function amountUntilFreeShipping(subtotalCents: number): number {
    const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
    return Math.max(0, remaining);
}
