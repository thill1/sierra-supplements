"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { formatCategory } from "@/lib/store-categories";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import type { Product, ProductVariantPublic } from "@/types/store";

type Props = {
    product: Product;
    variants: ProductVariantPublic[];
};

export function ProductDetailClient({ product, variants }: Props) {
    const purchasable = useMemo(
        () => variants.filter((v) => v.stockQuantity > 0),
        [variants],
    );

    const defaultId = useMemo(() => {
        const first = purchasable[0] ?? variants[0];
        return first?.id ?? 0;
    }, [purchasable, variants]);

    const [selectedId, setSelectedId] = useState(defaultId);

    const selected =
        variants.find((v) => v.id === selectedId) ??
        purchasable[0] ??
        variants[0];

    const useSelect = variants.length > 5;

    const priceFormatted = selected
        ? (selected.price / 100).toFixed(2)
        : (product.price / 100).toFixed(2);
    const compareFormatted = selected?.compareAtPrice
        ? (selected.compareAtPrice / 100).toFixed(2)
        : product.compareAtPrice
          ? (product.compareAtPrice / 100).toFixed(2)
          : null;

    const oos = selected && selected.stockQuantity <= 0;

    const cartPayload = useMemo(() => {
        if (!selected) return null;
        const lineName =
            variants.length === 1 && selected.label === "Default"
                ? product.name
                : `${product.name} — ${selected.label}`;
        return {
            id: product.id,
            slug: product.slug,
            name: lineName,
            price: selected.price,
            image: product.image,
            variantId: selected.id,
        };
    }, [product, selected, variants.length]);

    return (
        <>
            <div className="aspect-square bg-[var(--color-surface)] rounded-xl overflow-hidden relative">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-muted)] to-[var(--color-surface)]">
                        <span className="text-8xl opacity-30">💊</span>
                    </div>
                )}
                {compareFormatted && (
                    <span className="absolute top-4 right-4 px-3 py-1 text-sm font-bold bg-[var(--color-error)] text-white rounded">
                        Sale
                    </span>
                )}
            </div>

            <div>
                <span className="label text-[var(--color-accent)]">
                    {formatCategory(product.category)}
                </span>
                <h1 className="heading-xl mt-2 mb-4">{product.name}</h1>
                <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-[var(--color-accent)]">
                        ${priceFormatted}
                    </span>
                    {compareFormatted && (
                        <span className="text-lg text-[var(--color-text-muted)] line-through">
                            ${compareFormatted}
                        </span>
                    )}
                </div>

                {variants.length > 1 && (
                    <div className="mb-6">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Choose option
                        </p>
                        {useSelect ? (
                            <select
                                className="input w-full max-w-md"
                                value={selectedId}
                                onChange={(e) =>
                                    setSelectedId(Number(e.target.value))
                                }
                            >
                                {variants.map((v) => (
                                    <option
                                        key={v.id}
                                        value={v.id}
                                        disabled={v.stockQuantity <= 0}
                                    >
                                        {v.label}
                                        {v.stockQuantity <= 0
                                            ? " (out of stock)"
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex flex-col gap-2 max-w-md">
                                {variants.map((v) => (
                                    <label
                                        key={v.id}
                                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                                            selectedId === v.id
                                                ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/40"
                                                : "border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]/50"
                                        } ${v.stockQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="variant"
                                            className="accent-[var(--color-accent)]"
                                            checked={selectedId === v.id}
                                            disabled={v.stockQuantity <= 0}
                                            onChange={() => setSelectedId(v.id)}
                                        />
                                        <span className="text-sm font-medium">
                                            {v.label}
                                        </span>
                                        {v.stockQuantity <= 0 && (
                                            <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                                                Out of stock
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {product.shortDescription && (
                    <p className="body-lg mb-6">{product.shortDescription}</p>
                )}
                <div className="body-lg text-[var(--color-text-secondary)] space-y-4 mb-8 whitespace-pre-line">
                    {product.description}
                </div>

                <div className="flex flex-wrap gap-4">
                    {cartPayload && !oos ? (
                        <AddToCartButton product={cartPayload} />
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="btn btn-primary opacity-60 cursor-not-allowed"
                        >
                            Out of stock
                        </button>
                    )}
                    <Link href="/book" className="btn btn-secondary">
                        Book Consultation
                    </Link>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)]">
                    <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                        {[
                            "Curated, quality-focused brands",
                            "30-day money-back guarantee",
                            "Free shipping on orders over $80",
                        ].map((item) => (
                            <li
                                key={item}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
