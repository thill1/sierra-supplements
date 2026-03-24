/**
 * Shared store types used by ProductCard, StoreGrid, product detail, and cart.
 */

/** Sellable option from DB; id 0 = synthetic default for hardcoded-catalog fallback only. */
export type ProductVariantPublic = {
    id: number;
    label: string;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
};

export type Product = {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    /** Display price: lowest in-stock variant when `variants` is set, else catalog row. */
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    featured: boolean;
    variants?: ProductVariantPublic[];
};

/** Minimal product fields needed for AddToCartButton and cart items */
export type ProductCartPayload = {
    id: number;
    slug: string;
    /** Display name for the line (includes variant when applicable). */
    name: string;
    price: number;
    image: string | null;
    variantId: number;
};
