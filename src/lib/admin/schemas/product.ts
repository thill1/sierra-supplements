import { z } from "zod/v4";
import { productCategories, productStatuses } from "@/db/schema.pg";

export const productCategorySchema = z.enum(productCategories);
export const productStatusSchema = z.enum(productStatuses);

export const adminProductCreateSchema = z.object({
    slug: z.string().min(1).max(200),
    name: z.string().min(1).max(300),
    shortDescription: z.string().max(2000).optional().nullable(),
    description: z.string().min(1).max(50_000),
    price: z.number().nonnegative(),
    compareAtPrice: z.number().nonnegative().optional().nullable(),
    category: productCategorySchema,
    image: z.string().url().optional().nullable(),
    inStock: z.boolean().optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    sku: z.string().max(120).optional().nullable(),
    stockQuantity: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    status: productStatusSchema.optional(),
    primaryImageUrl: z.string().url().optional().nullable(),
    seoTitle: z.string().max(200).optional().nullable(),
    seoDescription: z.string().max(500).optional().nullable(),
    stripePriceId: z.string().max(200).optional().nullable(),
});

export const adminProductUpdateSchema = adminProductCreateSchema.partial();

export type AdminProductCreateInput = z.infer<typeof adminProductCreateSchema>;
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;
