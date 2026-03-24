import { describe, expect, it } from "vitest";
import type { DbTransaction } from "@/db";
import { syncParentProductStockFromVariants } from "@/lib/inventory/sync-parent-product-stock";

describe("syncParentProductStockFromVariants", () => {
    it("writes sum and inStock true when sum positive", async () => {
        const sets: unknown[] = [];
        const tx = {
            select: () => ({
                from: () => ({
                    where: () => Promise.resolve([{ sum: 12 }]),
                }),
            }),
            update: () => ({
                set: (v: unknown) => {
                    sets.push(v);
                    return {
                        where: () => Promise.resolve(undefined),
                    };
                },
            }),
        } as unknown as DbTransaction;

        const { sum } = await syncParentProductStockFromVariants(tx, 42);
        expect(sum).toBe(12);
        expect(sets[0]).toMatchObject({
            stockQuantity: 12,
            inStock: true,
        });
    });

    it("sets inStock false when sum is zero", async () => {
        const sets: unknown[] = [];
        const tx = {
            select: () => ({
                from: () => ({
                    where: () => Promise.resolve([{ sum: null }]),
                }),
            }),
            update: () => ({
                set: (v: unknown) => {
                    sets.push(v);
                    return {
                        where: () => Promise.resolve(undefined),
                    };
                },
            }),
        } as unknown as DbTransaction;

        const { sum } = await syncParentProductStockFromVariants(tx, 1);
        expect(sum).toBe(0);
        expect(sets[0]).toMatchObject({
            stockQuantity: 0,
            inStock: false,
        });
    });
});
