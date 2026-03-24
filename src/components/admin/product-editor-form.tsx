"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    Copy,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { STORE_CATEGORIES } from "@/lib/store-categories";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { ProductImagesEditor } from "@/components/admin/product-images-editor";

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export type ProductEditorValues = {
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    price: string;
    compareAtPrice: string;
    category: string;
    image: string;
    sku: string;
    stockQuantity: string;
    lowStockThreshold: string;
    status: "draft" | "active" | "archived";
    primaryImageUrl: string;
    seoTitle: string;
    seoDescription: string;
    stripePriceId: string;
    inStock: boolean;
    published: boolean;
    featured: boolean;
};

export type VariantEditorRow = {
    id?: number;
    label: string;
    price: string;
    compareAtPrice: string;
    sku: string;
    stockQuantity: string;
    lowStockThreshold: string;
    stripePriceId: string;
    sortOrder: string;
};

const emptyValues = (): ProductEditorValues => ({
    slug: "",
    name: "",
    shortDescription: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: STORE_CATEGORIES[0]?.slug ?? "protein",
    image: "",
    sku: "",
    stockQuantity: "0",
    lowStockThreshold: "2",
    status: "draft",
    primaryImageUrl: "",
    seoTitle: "",
    seoDescription: "",
    stripePriceId: "",
    inStock: true,
    published: false,
    featured: false,
});

type Props = {
    productId: number | null;
    initial?: Partial<ProductEditorValues> | null;
    /** Edit only: loaded from GET product (including default variant). */
    initialVariants?: VariantEditorRow[];
};

export function ProductEditorForm({
    productId,
    initial,
    initialVariants = [],
}: Props) {
    const router = useRouter();
    const [form, setForm] = useState<ProductEditorValues>(
        () => ({ ...emptyValues(), ...initial }),
    );
    const [slugManual, setSlugManual] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stagingUrls, setStagingUrls] = useState<string[]>([]);
    const [variants, setVariants] = useState<VariantEditorRow[]>([]);

    useEffect(() => {
        if (initial) {
            setForm((f) => ({ ...f, ...initial }));
        }
    }, [initial]);

    useEffect(() => {
        if (productId != null) {
            setVariants(
                initialVariants.length > 0
                    ? initialVariants
                    : [
                          {
                              label: "Default",
                              price: initial?.price ?? "0",
                              compareAtPrice: initial?.compareAtPrice ?? "",
                              sku: initial?.sku ?? "",
                              stockQuantity: initial?.stockQuantity ?? "0",
                              lowStockThreshold:
                                  initial?.lowStockThreshold ?? "2",
                              stripePriceId: initial?.stripePriceId ?? "",
                              sortOrder: "0",
                          },
                      ],
            );
        }
    }, [productId, initialVariants, initial]);

    useEffect(() => {
        if (productId != null) {
            setSlugManual(true);
        }
    }, [productId]);

    useEffect(() => {
        if (productId != null) return;
        if (!slugManual && form.name) {
            setForm((f) => ({ ...f, slug: slugify(form.name) }));
        }
    }, [form.name, slugManual, productId]);

    const isEdit = productId != null;
    const multiVariant = isEdit && variants.length > 1;

    const payload = useMemo(() => {
        const stockQty = parseInt(form.stockQuantity, 10);
        const lowTh = parseInt(form.lowStockThreshold, 10);
        return {
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
            primaryImageUrl: form.primaryImageUrl || form.image || null,
            sku: form.sku || null,
            stockQuantity: Number.isFinite(stockQty) ? stockQty : 0,
            lowStockThreshold: Number.isFinite(lowTh) ? lowTh : 2,
            status: form.status,
            seoTitle: form.seoTitle || null,
            seoDescription: form.seoDescription || null,
            stripePriceId: form.stripePriceId || null,
            inStock: form.inStock,
            published: form.published,
            featured: form.featured,
        };
    }, [form]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                const res = await fetch(`/api/admin/products/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Save failed");
                }

                const variantPayload = {
                    variants: variants.map((v, idx) => ({
                        id: v.id,
                        label: v.label.trim() || "Variant",
                        price: parseFloat(v.price) || 0,
                        compareAtPrice: v.compareAtPrice.trim()
                            ? parseFloat(v.compareAtPrice)
                            : null,
                        sku: v.sku.trim() || null,
                        stockQuantity: Number.isFinite(
                            parseInt(v.stockQuantity, 10),
                        )
                            ? parseInt(v.stockQuantity, 10)
                            : 0,
                        lowStockThreshold: Number.isFinite(
                            parseInt(v.lowStockThreshold, 10),
                        )
                            ? parseInt(v.lowStockThreshold, 10)
                            : 2,
                        stripePriceId: v.stripePriceId.trim() || null,
                        sortOrder: Number.isFinite(parseInt(v.sortOrder, 10))
                            ? parseInt(v.sortOrder, 10)
                            : idx,
                    })),
                };

                const resVar = await fetch(
                    `/api/admin/products/${productId}/variants`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(variantPayload),
                    },
                );
                type VariantsRes = {
                    variants: Array<{
                        id: number;
                        label: string;
                        price: number;
                        compareAtPrice: number | null;
                        sku: string | null;
                        stockQuantity: number;
                        lowStockThreshold: number;
                        stripePriceId: string | null;
                        sortOrder: number;
                    }>;
                };

                let data: VariantsRes | null = null;
                if (!resVar.ok) {
                    if (resVar.status === 403) {
                        toast.warning(
                            "Product saved. Updating variants requires a manager role.",
                        );
                    } else {
                        const err = await resVar.json().catch(() => ({}));
                        throw new Error(
                            err.error || "Saved product but variants failed",
                        );
                    }
                } else {
                    data = (await resVar.json()) as VariantsRes;
                }

                if (data?.variants?.length) {
                    setVariants(
                        data.variants.map((row, i) => ({
                            id: row.id,
                            label: row.label,
                            price: (row.price / 100).toFixed(2),
                            compareAtPrice:
                                row.compareAtPrice != null
                                    ? (row.compareAtPrice / 100).toFixed(2)
                                    : "",
                            sku: row.sku ?? "",
                            stockQuantity: String(row.stockQuantity),
                            lowStockThreshold: String(row.lowStockThreshold),
                            stripePriceId: row.stripePriceId ?? "",
                            sortOrder: String(row.sortOrder ?? i),
                        })),
                    );
                }

                toast.success("Product saved.");
                router.refresh();
            } else {
                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Create failed");
                }
                const created = (await res.json()) as { id: number };
                for (const url of stagingUrls) {
                    await fetch(`/api/admin/products/${created.id}/images`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            url,
                            kind: "gallery",
                            sortOrder: stagingUrls.indexOf(url),
                        }),
                    });
                }
                toast.success("Product created.");
                router.push(`/admin/products/${created.id}`);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Request failed");
        } finally {
            setSaving(false);
        }
    }

    async function archive() {
        if (
            !isEdit ||
            !confirm(
                "Archive this product? It will be hidden from the storefront.",
            )
        ) {
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Archive failed");
            toast.success("Product archived.");
            router.push("/admin/products");
        } catch {
            toast.error("Could not archive.");
        } finally {
            setSaving(false);
        }
    }

    async function duplicate() {
        if (!isEdit) return;
        setSaving(true);
        try {
            const res = await fetch(
                `/api/admin/products/${productId}/duplicate`,
                { method: "POST" },
            );
            if (!res.ok) throw new Error("Duplicate failed");
            const p = (await res.json()) as { id: number };
            toast.success("Duplicate created as draft.");
            router.push(`/admin/products/${p.id}`);
        } catch {
            toast.error("Could not duplicate.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-3xl">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to products
            </Link>

            <form onSubmit={submit} className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                        {isEdit ? "Edit product" : "New product"}
                    </h2>
                    {isEdit && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary text-sm"
                                onClick={() => duplicate()}
                                disabled={saving}
                            >
                                <Copy className="w-4 h-4" /> Duplicate
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary text-sm border-[var(--color-error)]/40 text-[var(--color-error)]"
                                onClick={() => archive()}
                                disabled={saving}
                            >
                                Archive
                            </button>
                        </div>
                    )}
                </div>

                <section className="card space-y-4 p-6">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                        Basic info
                    </h3>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Name *
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Slug (URL)
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={form.slug}
                            onChange={(e) => {
                                setSlugManual(true);
                                setForm({ ...form, slug: e.target.value });
                            }}
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Auto-generated from name; edit anytime.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Category
                        </label>
                        <select
                            className="input"
                            value={form.category}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
                        >
                            {STORE_CATEGORIES.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Short description
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={form.shortDescription}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    shortDescription: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Full description *
                        </label>
                        <textarea
                            className="input min-h-[120px]"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            SKU
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={form.sku}
                            onChange={(e) =>
                                setForm({ ...form, sku: e.target.value })
                            }
                        />
                    </div>
                </section>

                <section className="card space-y-4 p-6">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                        Pricing
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={form.price}
                                onChange={(e) =>
                                    setForm({ ...form, price: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Compare at ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={form.compareAtPrice}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        compareAtPrice: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </section>

                <section className="card space-y-4 p-6">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                        Inventory
                    </h3>
                    {multiVariant && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                            This product has multiple variants. Stock and
                            low-stock alerts are set per variant below; product
                            totals stay in sync automatically.
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Stock quantity
                            </label>
                            <input
                                type="number"
                                min={0}
                                className={`input ${multiVariant ? "opacity-60 cursor-not-allowed" : ""}`}
                                value={form.stockQuantity}
                                readOnly={multiVariant}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        stockQuantity: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Low stock alert at
                            </label>
                            <input
                                type="number"
                                min={0}
                                className={`input ${multiVariant ? "opacity-60 cursor-not-allowed" : ""}`}
                                value={form.lowStockThreshold}
                                readOnly={multiVariant}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        lowStockThreshold: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <label
                        className={`flex items-center gap-2 ${multiVariant ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                    >
                        <input
                            type="checkbox"
                            checked={form.inStock}
                            disabled={multiVariant}
                            onChange={(e) =>
                                setForm({ ...form, inStock: e.target.checked })
                            }
                        />
                        <span className="text-sm">In stock (legacy flag)</span>
                    </label>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Prefer adjusting counts from the Inventory page so every
                        change is logged.
                    </p>
                </section>

                {isEdit && (
                    <section className="card space-y-4 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                                Variants (flavor / size)
                            </h3>
                            <button
                                type="button"
                                className="btn btn-secondary text-sm inline-flex items-center gap-1"
                                onClick={() =>
                                    setVariants((prev) => [
                                        ...prev,
                                        {
                                            label: "New option",
                                            price: form.price || "0",
                                            compareAtPrice:
                                                form.compareAtPrice || "",
                                            sku: "",
                                            stockQuantity: "0",
                                            lowStockThreshold: "2",
                                            stripePriceId: "",
                                            sortOrder: String(prev.length),
                                        },
                                    ])
                                }
                            >
                                <Plus className="w-4 h-4" /> Add variant
                            </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Each variant has its own price, SKU, Stripe price ID,
                            and stock. Customers pick one on the product page.
                        </p>
                        <div className="space-y-6">
                            {variants.map((v, idx) => (
                                <div
                                    key={v.id ?? `new-${idx}`}
                                    className="rounded-lg border border-[var(--color-border-subtle)] p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium uppercase text-[var(--color-text-muted)]">
                                            Variant {idx + 1}
                                        </span>
                                        {variants.length > 1 && (
                                            <button
                                                type="button"
                                                className="text-[var(--color-error)] p-1 rounded hover:bg-[var(--color-error)]/10"
                                                aria-label="Remove variant"
                                                onClick={() =>
                                                    setVariants((prev) =>
                                                        prev.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium mb-1">
                                                Label (shown to customers) *
                                            </label>
                                            <input
                                                type="text"
                                                className="input text-sm"
                                                value={v.label}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      label: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Price ($) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input text-sm"
                                                value={v.price}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      price: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Compare at ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input text-sm"
                                                value={v.compareAtPrice}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      compareAtPrice:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                SKU
                                            </label>
                                            <input
                                                type="text"
                                                className="input text-sm"
                                                value={v.sku}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      sku: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Sort order
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="input text-sm"
                                                value={v.sortOrder}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      sortOrder:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Stock quantity
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="input text-sm"
                                                value={v.stockQuantity}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      stockQuantity:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Low stock alert at
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="input text-sm"
                                                value={v.lowStockThreshold}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      lowStockThreshold:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium mb-1">
                                                Stripe Price ID
                                            </label>
                                            <input
                                                type="text"
                                                className="input text-sm font-mono"
                                                placeholder="price_..."
                                                value={v.stripePriceId}
                                                onChange={(e) =>
                                                    setVariants((prev) =>
                                                        prev.map((row, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...row,
                                                                      stripePriceId:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="card space-y-4 p-6">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                        Photos
                    </h3>
                    <ProductImageUpload
                        value={form.image}
                        onChange={(url) => {
                            setForm((f) => ({
                                ...f,
                                image: url,
                                primaryImageUrl: f.primaryImageUrl || url,
                            }));
                        }}
                    />
                    {!isEdit && (
                        <div className="space-y-2">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Extra photos (optional) — attached after the
                                product is created.
                            </p>
                            <StagingUploader
                                urls={stagingUrls}
                                onAdd={(u) =>
                                    setStagingUrls((s) => [...s, u])
                                }
                            />
                        </div>
                    )}
                    {isEdit && productId != null && (
                        <ProductImagesEditor
                            productId={productId}
                            primaryImageUrl={
                                form.primaryImageUrl || form.image || null
                            }
                            onPrimaryChange={(url) =>
                                setForm((f) => ({
                                    ...f,
                                    primaryImageUrl: url ?? "",
                                    image: url ?? f.image,
                                }))
                            }
                        />
                    )}
                </section>

                <section className="card space-y-4 p-6">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--color-text-muted)]">
                        Publishing
                    </h3>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Status
                        </label>
                        <select
                            className="input"
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status: e.target.value as ProductEditorValues["status"],
                                })
                            }
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.published}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        published: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-sm">Published on store</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        featured: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-sm">Featured</span>
                        </label>
                    </div>
                </section>

                <section className="card overflow-hidden">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-[var(--color-bg-muted)]/40"
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                    >
                        Advanced
                        {advancedOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                    {advancedOpen && (
                        <div className="p-6 pt-0 space-y-4 border-t border-[var(--color-border-subtle)]">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Primary image URL
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.primaryImageUrl}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            primaryImageUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    SEO title
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.seoTitle}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            seoTitle: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    SEO description
                                </label>
                                <textarea
                                    className="input min-h-[80px]"
                                    value={form.seoDescription}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            seoDescription: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Stripe Price ID
                                </label>
                                <input
                                    type="text"
                                    className="input font-mono text-sm"
                                    placeholder="price_..."
                                    value={form.stripePriceId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            stripePriceId: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </section>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
                    </button>
                    <Link href="/admin/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

function StagingUploader({
    urls,
    onAdd,
}: {
    urls: string[];
    onAdd: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    return (
        <div className="space-y-2">
            <label className="btn btn-secondary text-sm cursor-pointer inline-flex">
                Add gallery photo (before create)
                <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                    disabled={uploading}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        setUploading(true);
                        try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/admin/upload", {
                                method: "POST",
                                body: fd,
                            });
                            const data = (await res.json()) as {
                                error?: string;
                                url?: string;
                            };
                            if (!res.ok || !data.url) {
                                throw new Error(data.error || "Upload failed");
                            }
                            onAdd(data.url);
                            toast.success("Photo added to staging.");
                        } catch (err) {
                            toast.error(
                                err instanceof Error
                                    ? err.message
                                    : "Upload failed",
                            );
                        } finally {
                            setUploading(false);
                        }
                    }}
                />
            </label>
            {urls.length > 0 && (
                <ul className="text-xs text-[var(--color-text-muted)] space-y-1">
                    {urls.map((u) => (
                        <li key={u} className="truncate">
                            {u}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
