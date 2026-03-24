/**
 * Edge-trigger for low-stock admin email: crossed from above threshold into at/below,
 * while still in stock (not OOS).
 */
export function shouldNotifyLowStockEdge(params: {
    previousQty: number;
    newQty: number;
    lowStockThreshold: number;
}): boolean {
    const { previousQty, newQty, lowStockThreshold } = params;
    return (
        newQty > 0 &&
        newQty <= lowStockThreshold &&
        previousQty > lowStockThreshold
    );
}
