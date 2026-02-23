"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
} from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/store-categories";

type Product = {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    inStock: boolean | null;
    published: boolean | null;
    featured: boolean | null;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setProducts(data);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this product?")) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch {
            alert("Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading products…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Products</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Manage supplement store products. Seed mock data with{" "}
                        <code className="text-[var(--color-accent)] bg-[var(--color-bg-muted)] px-1 rounded">
                            pnpm db:seed
                        </code>
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            {error && (
                <div className="card border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-4">
                    <p className="text-[var(--color-error)]">{error}</p>
                    <p className="text-sm mt-2">
                        Ensure the database is running and migrations are applied:{" "}
                        <code className="text-[var(--color-accent)]">pnpm db:push</code>
                    </p>
                </div>
            )}

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                                    >
                                        No products. Run{" "}
                                        <code className="text-[var(--color-accent)]">
                                            pnpm db:seed
                                        </code>{" "}
                                        to add placeholder products, or add one manually.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-[var(--color-bg-muted)]/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                /{product.slug}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4">
                                            ${(product.price / 100).toFixed(2)}
                                            {product.compareAtPrice && (
                                                <span className="text-xs text-[var(--color-text-muted)] line-through ml-1">
                                                    $
                                                    {(
                                                        product.compareAtPrice / 100
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded ${
                                                    product.published
                                                        ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                                                        : "bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]"
                                                }`}
                                            >
                                                {product.published
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/store/${product.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                    aria-label="View product"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                    aria-label="Edit product"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                                                    aria-label="Delete product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
