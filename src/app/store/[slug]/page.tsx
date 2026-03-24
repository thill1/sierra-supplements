import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { getHardcodedProductBySlug } from "@/lib/products-data";
import { allowHardcodedCatalogFallback } from "@/lib/catalog-policy";
import { CatalogUnavailableError } from "@/lib/catalog-errors";
import { logServerError } from "@/lib/observability";
import type { Metadata } from "next";
import type { Product, ProductVariantPublic } from "@/types/store";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function buildProductFromDbRow(
  row: {
    id: number;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    price: number;
    compareAtPrice: number | null;
    category: string;
    image: string | null;
    featured: boolean | null;
    stockQuantity: number;
  },
  variantRows: {
    id: number;
    label: string;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
  }[],
): Product {
  let variants: ProductVariantPublic[] = variantRows.map((v) => ({
    id: v.id,
    label: v.label,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    stockQuantity: v.stockQuantity,
  }));

  if (variants.length === 0) {
    variants = [
      {
        id: 0,
        label: "Default",
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        stockQuantity: row.stockQuantity,
      },
    ];
  }

  const purchasable = variants.filter((v) => v.stockQuantity > 0);
  const minPrice =
    purchasable.length > 0
      ? Math.min(...purchasable.map((v) => v.price))
      : (variants[0]?.price ?? row.price);
  const compares = purchasable
    .map((v) => v.compareAtPrice)
    .filter((c): c is number => c != null && c > minPrice);
  const minCompare = compares.length > 0 ? Math.min(...compares) : null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    price: minPrice,
    compareAtPrice: minCompare ?? row.compareAtPrice,
    category: row.category,
    image: row.image,
    featured: row.featured ?? false,
    variants,
  };
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  const fallback = allowHardcodedCatalogFallback();
  try {
    const { db } = await import("@/db");
    const { products, productVariants } = await import("@/db/schema");
    const { eq, and, gt, asc } = await import("drizzle-orm");
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

    let varRows: {
      id: number;
      label: string;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
    }[] = [];
    try {
      varRows = await db
        .select({
          id: productVariants.id,
          label: productVariants.label,
          price: productVariants.price,
          compareAtPrice: productVariants.compareAtPrice,
          stockQuantity: productVariants.stockQuantity,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, row.id))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));
    } catch (err) {
      logServerError("store:product_detail_variants", err, {
        productId: row.id,
        slug,
      });
    }

    return buildProductFromDbRow(row, varRows);
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

  const variants = product.variants ?? [];

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
          <ProductDetailClient product={product} variants={variants} />
        </div>
      </section>
    </div>
  );
}
