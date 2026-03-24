import { describe, expect, it } from "vitest";
import type { DbTransaction } from "@/db";
import { auditLogs, inventoryMovements } from "@/db/schema.pg";
import {
    applyStockChangeInTx,
    InsufficientStockError,
} from "@/lib/inventory/adjust-stock";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";

/** Minimal tx mock for variant-based stock + sum sync + inserts. */
function mockVariantTx(initialStock: number) {
    const inserts: { table: unknown; values: unknown }[] = [];
    let whereCall = 0;

    const tx = {
        select: () => ({
            from: () => ({
                where: () => {
                    whereCall += 1;
                    if (whereCall === 1) {
                        return {
                            for: () => ({
                                limit: () =>
                                    Promise.resolve([
                                        {
                                            id: 7,
                                            productId: 9,
                                            stockQuantity: initialStock,
                                            label: "Default",
                                        },
                                    ]),
                            }),
                        };
                    }
                    return Promise.resolve([{ sum: initialStock - 3 }]);
                },
            }),
        }),
        update: () => ({
            set: () => ({
                where: () => Promise.resolve(undefined),
            }),
        }),
        insert: (table: unknown) => ({
            values: (values: unknown) => {
                inserts.push({ table, values });
                return Promise.resolve(undefined);
            },
        }),
        _inserts: inserts,
    };

    return tx as unknown as { _inserts: typeof inserts } & DbTransaction;
}

describe("applyStockChangeInTx (variants)", () => {
    it("updates variant stock, syncs parent, records movement and audit", async () => {
        const tx = mockVariantTx(10);

        const { newQuantity } = await applyStockChangeInTx(tx, {
            variantId: 7,
            delta: -3,
            reason: "test",
            source: INVENTORY_SOURCE.adjustment,
            actorUserId: 2,
        });

        expect(newQuantity).toBe(7);
        expect(tx._inserts).toHaveLength(2);
        expect(tx._inserts[0].table).toBe(inventoryMovements);
        expect(tx._inserts[0].values).toMatchObject({
            productId: 9,
            variantId: 7,
            delta: -3,
            source: INVENTORY_SOURCE.adjustment,
            actorUserId: 2,
        });
        expect(tx._inserts[1].table).toBe(auditLogs);
    });

    it("throws when stock would go negative", async () => {
        const tx = mockVariantTx(1);

        await expect(
            applyStockChangeInTx(tx, {
                variantId: 7,
                delta: -5,
                reason: "oversell",
                source: INVENTORY_SOURCE.admin,
                actorUserId: null,
            }),
        ).rejects.toBeInstanceOf(InsufficientStockError);
    });

    it("throws when variant is missing", async () => {
        let whereCall = 0;
        const tx = {
            select: () => ({
                from: () => ({
                    where: () => {
                        whereCall += 1;
                        if (whereCall === 1) {
                            return {
                                for: () => ({
                                    limit: () => Promise.resolve([]),
                                }),
                            };
                        }
                        return Promise.resolve([{ sum: 0 }]);
                    },
                }),
            }),
            update: () => ({
                set: () => ({
                    where: () => Promise.resolve(undefined),
                }),
            }),
            insert: () => ({
                values: () => Promise.resolve(undefined),
            }),
        } as unknown as DbTransaction;

        await expect(
            applyStockChangeInTx(tx, {
                variantId: 999,
                delta: 1,
                reason: "x",
                source: INVENTORY_SOURCE.restock,
                actorUserId: null,
            }),
        ).rejects.toThrow("Variant not found");
    });
});
