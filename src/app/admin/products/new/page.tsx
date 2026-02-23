"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/store-categories";

export default function AdminNewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
                    name: form.name,
                    shortDescription: form.shortDescription || undefined,
                    description: form.description || form.shortDescription,
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
                const err = await res.json();
                throw new Error(err.error || "Failed to create");
            }
            const product = await res.json();
            router.push(`/admin/products`);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>

            <h2 className="text-xl font-bold mb-6">Add Product</h2>

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
                    <label className="block text-sm font-medium mb-1.5">Slug (URL)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="auto-generated from name"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                        className="input min-h-[100px]"
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
                <div>
                    <label className="block text-sm font-medium mb-1.5">Image URL</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="/images/store/product.jpg"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                </div>
                <div className="flex gap-6">
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
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Creating…" : "Create Product"}
                    </button>
                    <Link href="/admin/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
