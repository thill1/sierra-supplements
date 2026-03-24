import { describe, expect, it } from "vitest";
import type { DbTransaction } from "@/db";
import { auditLogs, inventoryMovements } from "@/db/schema.pg";
import {
    applyStockChangeInTx,
    InsufficientStockError,
} from "@/lib/inventory/adjust-stock";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";

function mockTx(initial: {
    id: number;
    stockQuantity: number;
    inStock: boolean | null;
}) {
    const inserts: { table: unknown; values: unknown }[] = [];

    const tx = {
        select: () => ({
            from: () => ({
                where: () => ({
                    for: () => ({
                        limit: () => Promise.resolve([{ ...initial }]),
                    }),
                }),
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

describe("applyStockChangeInTx", () => {
    it("updates stock, records movement and audit", async () => {
        const tx = mockTx({
            id: 9,
            stockQuantity: 10,
            inStock: true,
        });

        const { newQuantity } = await applyStockChangeInTx(tx, {
            productId: 9,
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
            delta: -3,
            source: INVENTORY_SOURCE.adjustment,
            actorUserId: 2,
        });
        expect(tx._inserts[1].table).toBe(auditLogs);
    });

    it("throws when stock would go negative", async () => {
        const tx = mockTx({
            id: 1,
            stockQuantity: 1,
            inStock: true,
        });

        await expect(
            applyStockChangeInTx(tx, {
                productId: 1,
                delta: -5,
                reason: "oversell",
                source: INVENTORY_SOURCE.admin,
                actorUserId: null,
            }),
        ).rejects.toBeInstanceOf(InsufficientStockError);
    });

    it("throws when product is missing", async () => {
        const tx = {
            select: () => ({
                from: () => ({
                    where: () => ({
                        for: () => ({
                            limit: () => Promise.resolve([]),
                        }),
                    }),
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
                productId: 999,
                delta: 1,
                reason: "x",
                source: INVENTORY_SOURCE.restock,
                actorUserId: null,
            }),
        ).rejects.toThrow("Product not found");
    });

});
