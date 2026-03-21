"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Pencil,
    ExternalLink,
    Copy,
    Archive,
    Search,
} from "lucide-react";
import { toast } from "sonner";

type AdminProduct = {
    id: number;
    slug: string;
    name: string;
    sku: string | null;
    category: string;
    price: number;
    stockQuantity: number;
    status: string;
    published: boolean | null;
    image: string | null;
    primaryImageUrl: string | null;
    updatedAt: string | null;
};

const STATUSES = [
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
];

const STOCK = [
    { value: "", label: "Any stock" },
    { value: "low", label: "Low stock" },
    { value: "out", label: "Out of stock" },
    { value: "ok", label: "Healthy" },
];

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");

    const queryString = useMemo(() => {
        const p = new URLSearchParams();
        if (q.trim()) p.set("q", q.trim());
        if (status) p.set("status", status);
        if (stock) p.set("stock", stock);
        if (category) p.set("category", category);
        const s = p.toString();
        return s ? `?${s}` : "";
    }, [q, status, stock, category]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products${queryString}`);
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
    }, [queryString]);

    useEffect(() => {
        const t = setTimeout(() => {
            void fetchProducts();
        }, 300);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    const handleArchive = async (id: number) => {
        if (!confirm("Archive this product? It will be hidden from the store.")) {
            return;
        }
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Archived.");
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error("Could not archive.");
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/products/${id}/duplicate`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed");
            const p = (await res.json()) as { id: number };
            toast.success("Duplicate created.");
            router.push(`/admin/products/${p.id}`);
        } catch {
            toast.error("Could not duplicate.");
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading products…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h2 className="text-xl font-bold">Products</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Search, filter, and manage catalog & inventory fields.
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="btn btn-primary flex items-center gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" /> Add product
                </Link>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="search"
                        className="input pl-9 w-full"
                        placeholder="Search name, slug, SKU…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <select
                    className="input w-auto"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All categories</option>
                    <option value="protein">Protein</option>
                    <option value="pre-workout">Pre-workout</option>
                    <option value="creatine">Creatine</option>
                    <option value="vitamins">Vitamins</option>
                    <option value="bcaas">BCAAs</option>
                    <option value="omega-3">Omega-3</option>
                    <option value="electrolytes">Electrolytes</option>
                    <option value="bars">Bars</option>
                    <option value="carbs">Carbs</option>
                </select>
                <select
                    className="input w-auto"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    {STATUSES.map((s) => (
                        <option key={s.value || "all"} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <select
                    className="input w-auto"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                >
                    {STOCK.map((s) => (
                        <option key={s.value || "any"} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="card border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-4">
                    <p className="text-[var(--color-error)]">{error}</p>
                    <p className="text-sm mt-2">
                        Run{" "}
                        <code className="text-[var(--color-accent)]">
                            pnpm db:push
                        </code>{" "}
                        and{" "}
                        <code className="text-[var(--color-accent)]">
                            pnpm db:seed-admins
                        </code>
                        .
                    </p>
                </div>
            )}

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Image
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Product
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    SKU
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Price
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Stock
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                                    Updated
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {products.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                                    >
                                        No products match.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const img =
                                        product.primaryImageUrl || product.image;
                                    const updated = product.updatedAt
                                        ? new Date(
                                              product.updatedAt,
                                          ).toLocaleDateString()
                                        : "—";
                                    return (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-[var(--color-bg-muted)]/30"
                                        >
                                            <td className="px-4 py-3 w-16">
                                                {img ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={img}
                                                        alt=""
                                                        className="w-12 h-12 object-contain rounded border border-[var(--color-border-subtle)]"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-[var(--color-bg-muted)] border border-dashed border-[var(--color-border-subtle)]" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-sm">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    /{product.slug}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                {product.sku ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm capitalize">
                                                {product.category.replace(
                                                    "-",
                                                    " ",
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium">
                                                ${(product.price / 100).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm tabular-nums">
                                                {product.stockQuantity}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-muted)] capitalize">
                                                    {product.status}
                                                </span>
                                                {product.published && (
                                                    <span className="text-xs ml-1 text-[var(--color-success)]">
                                                        live
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                                                {updated}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1 flex-wrap">
                                                    <a
                                                        href={`/store/${product.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                        aria-label="View"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDuplicate(
                                                                product.id,
                                                            )
                                                        }
                                                        className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                        aria-label="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    {product.status !==
                                                        "archived" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleArchive(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                                                            aria-label="Archive"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
