"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function CartIcon() {
    const { itemCount } = useCart();

    return (
        <Link
            href="/store/cart"
            className="relative p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
            aria-label={`Cart with ${itemCount} items`}
        >
            <ShoppingCart className="w-5 h-5 text-[var(--color-text-secondary)]" />
            {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                </span>
            )}
        </Link>
    );
}
