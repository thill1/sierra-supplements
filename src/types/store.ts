/**
 * Shared store types used by ProductCard, StoreGrid, product detail, and cart.
 */

export type Product = {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    featured: boolean;
};

/** Minimal product fields needed for AddToCartButton and cart items */
export type ProductCartPayload = Pick<
    Product,
    "id" | "slug" | "name" | "price" | "image"
>;
