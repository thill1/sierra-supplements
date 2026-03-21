"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/store-categories";
import { ProductImageUpload } from "@/components/admin/product-image-upload";

export default function AdminEditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<{
        slug: string;
        name: string;
        shortDescription: string;
        description: string;
        price: string;
        compareAtPrice: string;
        category: string;
        image: string;
        inStock: boolean;
        published: boolean;
        featured: boolean;
    }>({
        slug: "",
        name: "",
        shortDescription: "",
        description: "",
        price: "",
        compareAtPrice: "",
        category: STORE_CATEGORIES[0].slug,
        image: "",
        inStock: true,
        published: false,
        featured: false,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/admin/products/${id}`);
                if (!res.ok) throw new Error("Not found");
                const p = (await res.json()) as {
                    slug: string;
                    name: string;
                    shortDescription: string | null;
                    description: string;
                    price: number;
                    compareAtPrice: number | null;
                    category: string;
                    image: string | null;
                    inStock: boolean | null;
                    published: boolean | null;
                    featured: boolean | null;
                };
                if (cancelled) return;
                setForm({
                    slug: p.slug,
                    name: p.name,
                    shortDescription: p.shortDescription ?? "",
                    description: p.description,
                    price: (p.price / 100).toFixed(2),
                    compareAtPrice:
                        p.compareAtPrice != null ? (p.compareAtPrice / 100).toFixed(2) : "",
                    category: p.category,
                    image: p.image ?? "",
                    inStock: p.inStock ?? true,
                    published: p.published ?? false,
                    featured: p.featured ?? false,
                });
            } catch {
                router.push("/admin/products");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: form.slug,
                    name: form.name,
                    shortDescription: form.shortDescription || null,
                    description: form.description,
                    price: parseFloat(form.price) || 0,
                    compareAtPrice: form.compareAtPrice
                        ? parseFloat(form.compareAtPrice)
                        : null,
                    category: form.category,
                    image: form.image || null,
                    inStock: form.inStock,
                    published: form.published,
                    featured: form.featured,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to update");
            }
            router.push("/admin/products");
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to update product");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading product…</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>

            <h2 className="text-xl font-bold mb-6">Edit Product</h2>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                    <input
                        type="text"
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Slug (URL) *</label>
                    <input
                        type="text"
                        className="input"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Category</label>
                    <select
                        className="input"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                        {STORE_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Short Description</label>
                    <input
                        type="text"
                        className="input"
                        value={form.shortDescription}
                        onChange={(e) =>
                            setForm({ ...form, shortDescription: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Description *</label>
                    <textarea
                        className="input min-h-[120px]"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Price ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Compare at ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            value={form.compareAtPrice}
                            onChange={(e) =>
                                setForm({ ...form, compareAtPrice: e.target.value })
                            }
                        />
                    </div>
                </div>
                <ProductImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
                <div className="flex gap-6 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.inStock}
                            onChange={(e) =>
                                setForm({ ...form, inStock: e.target.checked })
                            }
                        />
                        <span className="text-sm">In stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) =>
                                setForm({ ...form, published: e.target.checked })
                            }
                        />
                        <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) =>
                                setForm({ ...form, featured: e.target.checked })
                            }
                        />
                        <span className="text-sm">Featured</span>
                    </label>
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                    <Link href="/admin/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
