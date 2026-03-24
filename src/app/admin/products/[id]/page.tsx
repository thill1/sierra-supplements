"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ProductEditorForm,
    type ProductEditorValues,
    type VariantEditorRow,
} from "@/components/admin/product-editor-form";
import { STORE_CATEGORIES } from "@/lib/store-categories";

type VariantApiRow = {
    id: number;
    label: string;
    price: number;
    compareAtPrice: number | null;
    sku: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    stripePriceId: string | null;
    sortOrder: number;
};

type Row = {
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    sku: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    status: "draft" | "active" | "archived";
    primaryImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    stripePriceId: string | null;
    inStock: boolean | null;
    published: boolean | null;
    featured: boolean | null;
    variants?: VariantApiRow[];
};

function mapVariantsFromApi(rows: VariantApiRow[]): VariantEditorRow[] {
    return rows.map((row, i) => ({
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
    }));
}

function mapRow(p: Row): ProductEditorValues {
    const cat = STORE_CATEGORIES.some((c) => c.slug === p.category)
        ? p.category
        : STORE_CATEGORIES[0]!.slug;
    return {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription ?? "",
        description: p.description,
        price: (p.price / 100).toFixed(2),
        compareAtPrice:
            p.compareAtPrice != null ? (p.compareAtPrice / 100).toFixed(2) : "",
        category: cat,
        image: p.image ?? "",
        sku: p.sku ?? "",
        stockQuantity: String(p.stockQuantity ?? 0),
        lowStockThreshold: String(p.lowStockThreshold ?? 2),
        status: p.status ?? "active",
        primaryImageUrl: p.primaryImageUrl ?? "",
        seoTitle: p.seoTitle ?? "",
        seoDescription: p.seoDescription ?? "",
        stripePriceId: p.stripePriceId ?? "",
        inStock: p.inStock ?? true,
        published: p.published ?? false,
        featured: p.featured ?? false,
    };
}

export default function AdminEditProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number.parseInt(String(params.id), 10);
    const [initial, setInitial] = useState<ProductEditorValues | null>(null);
    const [initialVariants, setInitialVariants] = useState<
        VariantEditorRow[] | null
    >(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/admin/products/${id}`);
                if (!res.ok) throw new Error("Not found");
                const p = (await res.json()) as Row;
                if (!cancelled) {
                    setInitial(mapRow(p));
                    setInitialVariants(
                        p.variants?.length
                            ? mapVariantsFromApi(p.variants)
                            : [],
                    );
                    setError(null);
                }
            } catch {
                if (!cancelled) {
                    setError("Could not load product");
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    if (!Number.isFinite(id)) {
        return (
            <p className="text-[var(--color-error)]">Invalid product id.</p>
        );
    }

    if (error) {
        return (
            <p className="text-[var(--color-error)]">
                {error}{" "}
                <button
                    type="button"
                    className="text-[var(--color-accent)] underline"
                    onClick={() => router.push("/admin/products")}
                >
                    Back
                </button>
            </p>
        );
    }

    if (!initial) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading…</p>
            </div>
        );
    }

    return (
        <ProductEditorForm
            productId={id}
            initial={initial}
            initialVariants={initialVariants ?? []}
        />
    );
}
