import { and, eq, gt } from "drizzle-orm";
import { products } from "@/db/schema";

/**
 * Single `WHERE` fragment for public store listings and product-by-slug:
 * published, active status, and stock &gt; 0.
 */
export const publicCatalogProductWhere = and(
    eq(products.published, true),
    eq(products.status, "active"),
    gt(products.stockQuantity, 0),
)!;
