"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { ProductCartPayload } from "@/types/store";

export function AddToCartButton({
    product,
    compact = false,
}: {
    product: ProductCartPayload;
    compact?: boolean;
}) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        addItem({
            productId: product.id,
            variantId: product.variantId,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            className={`btn flex items-center gap-2 ${compact ? "text-sm py-1.5 px-3 w-full sm:w-auto" : ""} ${
                added ? "btn-secondary bg-[var(--color-success)]/20 border-[var(--color-success)] text-[var(--color-success)]" : "btn-primary"
            }`}
        >
            {added ? (
                <>
                    <Check className={compact ? "w-4 h-4" : "w-5 h-5"} /> Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart className={compact ? "w-4 h-4" : "w-5 h-5"} /> Add to Cart
                </>
            )}
        </button>
    );
}
