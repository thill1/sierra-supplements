import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { formatCategory } from "@/lib/store-categories";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { getHardcodedProductBySlug } from "@/lib/products-data";
import { allowHardcodedCatalogFallback } from "@/lib/catalog-policy";
import { CatalogUnavailableError } from "@/lib/catalog-errors";
import type { Metadata } from "next";
import type { Product } from "@/types/store";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

async function getProductBySlug(slug: string): Promise<Product | null> {
    const fallback = allowHardcodedCatalogFallback();
    try {
        const { db } = await import("@/db");
        const { products } = await import("@/db/schema");
        const { eq, and, gt } = await import("drizzle-orm");
        const result = await db
            .select()
            .from(products)
            .where(
                and(
                    eq(products.slug, slug),
                    eq(products.published, true),
                    eq(products.status, "active"),
                    gt(products.stockQuantity, 0),
                ),
            )
            .limit(1);
        const row = result[0];
        if (!row) {
            if (fallback) return getHardcodedProductBySlug(slug);
            return null;
        }
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            shortDescription: row.shortDescription,
            description: row.description,
            price: row.price,
            compareAtPrice: row.compareAtPrice,
            category: row.category,
            image: row.image,
            featured: row.featured ?? false,
        };
    } catch {
        if (fallback) return getHardcodedProductBySlug(slug);
        throw new CatalogUnavailableError();
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await getProductBySlug(slug);
        if (!product) return {};
        return {
            title: product.name,
            description: product.shortDescription || product.description,
        };
    } catch {
        return {};
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) notFound();

    const priceFormatted = (product.price / 100).toFixed(2);
    const compareFormatted = product.compareAtPrice
        ? (product.compareAtPrice / 100).toFixed(2)
        : null;

    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Store
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
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

                        {product.shortDescription && (
                            <p className="body-lg mb-6">{product.shortDescription}</p>
                        )}
                        <div className="body-lg text-[var(--color-text-secondary)] space-y-4 mb-8 whitespace-pre-line">
                            {product.description}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <AddToCartButton product={product} />
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
                </div>
            </section>
        </div>
    );
}
