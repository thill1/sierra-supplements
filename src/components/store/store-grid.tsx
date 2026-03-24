import { ProductCard } from "./product-card";
import { getHardcodedProducts } from "@/lib/products-data";
import { allowHardcodedCatalogFallback } from "@/lib/catalog-policy";
import { CatalogUnavailableError } from "@/lib/catalog-errors";
import { logServerError } from "@/lib/observability";
import type { Product, ProductVariantPublic } from "@/types/store";

function attachVariantsToProduct(
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
  variants: ProductVariantPublic[],
): Product {
  let vRows = variants;
  if (vRows.length === 0) {
    vRows = [
      {
        id: 0,
        label: "Default",
        price: row.price,
        compareAtPrice: row.compareAtPrice,
        stockQuantity: row.stockQuantity,
      },
    ];
  }

  const purchasable = vRows.filter((v) => v.stockQuantity > 0);
  const minPrice =
    purchasable.length > 0
      ? Math.min(...purchasable.map((v) => v.price))
      : (vRows[0]?.price ?? row.price);
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
    variants: vRows,
  };
}

async function getProductsFromDb(
  category?: string | null,
): Promise<{ ok: true; products: Product[] } | { ok: false }> {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const { eq, desc, and, gt, inArray, asc } = await import("drizzle-orm");
    const { productVariants } = await import("@/db/schema");
    const conditions = [
      eq(products.published, true),
      eq(products.status, "active"),
      gt(products.stockQuantity, 0),
    ];
    if (category) conditions.push(eq(products.category, category));
    const rows = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.featured), desc(products.createdAt));

    if (rows.length === 0) {
      return { ok: true, products: [] };
    }

    const pids = rows.map((r) => r.id);
    let varRows: (typeof productVariants.$inferSelect)[] = [];
    try {
      varRows = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, pids))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));
    } catch (err) {
      logServerError("store:product_variants_query", err, {
        productIds: pids,
      });
    }

    const byPid = new Map<number, ProductVariantPublic[]>();
    for (const v of varRows) {
      const list = byPid.get(v.productId) ?? [];
      list.push({
        id: v.id,
        label: v.label,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stockQuantity: v.stockQuantity,
      });
      byPid.set(v.productId, list);
    }

    const productsOut = rows.map((r) =>
      attachVariantsToProduct(r, byPid.get(r.id) ?? []),
    );

    return { ok: true, products: productsOut };
  } catch (err) {
    logServerError("store:getProductsFromDb", err, { category });
    return { ok: false };
  }
}

export async function StoreGrid({
  category,
}: { category?: string | null } = {}) {
  const fallback = allowHardcodedCatalogFallback();
  const dbResult = await getProductsFromDb(category);

  if (!dbResult.ok) {
    if (fallback) {
      const items = getHardcodedProducts(category);
      return <ProductGrid items={items} />;
    }
    throw new CatalogUnavailableError();
  }

  let items = dbResult.products;
  if (items.length === 0 && fallback) {
    items = getHardcodedProducts(category);
  }

  return <ProductGrid items={items} />;
}

function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-16">
          <p className="body-lg text-[var(--color-text-muted)]">
            No products in this category.
          </p>
        </div>
      ) : (
        items.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
