import type { ResolvedAdmin } from "@/lib/admin-auth";
import { editorCanEditInventory, editorCanEditPricing } from "@/lib/admin-auth";
import type { AdminProductCreateInput, AdminProductUpdateInput } from "@/lib/admin/schemas/product";

export function dollarsToCents(n: number): number {
    return Math.round(n * 100);
}

/** Remove fields editors are not allowed to set (server-side; never trust the client). */
export function applyEditorProductRestrictions<
    T extends AdminProductCreateInput | AdminProductUpdateInput,
>(body: T, admin: ResolvedAdmin): T {
    if (editorCanEditPricing(admin) && editorCanEditInventory(admin)) {
        return body;
    }
    const next = { ...body } as Record<string, unknown>;
    if (!editorCanEditPricing(admin)) {
        delete next.price;
        delete next.compareAtPrice;
        delete next.stripePriceId;
        delete next.published;
        delete next.status;
    }
    if (!editorCanEditInventory(admin)) {
        delete next.stockQuantity;
        delete next.lowStockThreshold;
        delete next.inStock;
    }
    return next as T;
}
