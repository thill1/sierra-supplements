import { z } from "zod/v4";

export const adminVariantRowSchema = z.object({
    id: z.number().int().positive().optional(),
    label: z.string().min(1).max(200),
    price: z.number().nonnegative(),
    compareAtPrice: z.number().nonnegative().optional().nullable(),
    sku: z.string().max(120).optional().nullable(),
    stockQuantity: z.number().int().nonnegative(),
    lowStockThreshold: z.number().int().nonnegative(),
    stripePriceId: z.string().max(200).optional().nullable(),
    sortOrder: z.number().int().nonnegative(),
});

export const adminProductVariantsReplaceSchema = z.object({
    variants: z.array(adminVariantRowSchema).min(1).max(50),
});

export type AdminVariantRowInput = z.infer<typeof adminVariantRowSchema>;
export type AdminProductVariantsReplaceInput = z.infer<
    typeof adminProductVariantsReplaceSchema
>;
