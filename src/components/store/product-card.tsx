"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { formatCategory } from "@/lib/store-categories";

type Product = {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    featured: boolean | null;
};

export function ProductCard({ product }: { product: Product }) {
    const [imgError, setImgError] = useState(false);
    const priceFormatted = (product.price / 100).toFixed(2);
    const compareFormatted = product.compareAtPrice
        ? (product.compareAtPrice / 100).toFixed(2)
        : null;

    return (
        <div className="card group block overflow-hidden">
        <Link href={`/store/${product.slug}`} className="block">
            {/* Image area */}
            <div className="aspect-square bg-[var(--color-surface)] relative overflow-hidden">
                {product.image && !imgError ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-muted)] to-[var(--color-surface)]">
                        <span className="text-5xl opacity-30">💊</span>
                    </div>
                )}
                {product.featured && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-bold bg-[var(--color-accent)] text-[var(--color-bg)] rounded">
                        Featured
                    </span>
                )}
                {compareFormatted && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-[var(--color-error)]/90 text-white rounded">
                        Sale
                    </span>
                )}
            </div>

            <div className="p-4">
                <span className="text-xs font-medium text-[var(--color-accent)] uppercase tracking-wider">
                    {formatCategory(product.category)}
                </span>
                <h3 className="font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {product.name}
                </h3>
                <p className="body-sm line-clamp-2 mb-4">
                    {product.shortDescription}
                </p>

                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[var(--color-accent)]">
                        ${priceFormatted}
                    </span>
                    {compareFormatted && (
                        <span className="text-sm text-[var(--color-text-muted)] line-through">
                            ${compareFormatted}
                        </span>
                    )}
                </div>
            </div>
        </Link>
        <div className="px-4 pb-4" onClick={(e) => e.preventDefault()}>
            <AddToCartButton
                compact
                product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                }}
            />
        </div>
        </div>
    );
}
