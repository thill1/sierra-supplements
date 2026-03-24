import { describe, expect, it } from "vitest";
import { shouldNotifyLowStockEdge } from "@/lib/inventory/low-stock-edge";

describe("shouldNotifyLowStockEdge", () => {
    it("is true when crossing from above threshold into at/below, still in stock", () => {
        expect(
            shouldNotifyLowStockEdge({
                previousQty: 3,
                newQty: 2,
                lowStockThreshold: 2,
            }),
        ).toBe(true);
    });

    it("is false when already at or below threshold", () => {
        expect(
            shouldNotifyLowStockEdge({
                previousQty: 2,
                newQty: 1,
                lowStockThreshold: 2,
            }),
        ).toBe(false);
    });

    it("is false when out of stock", () => {
        expect(
            shouldNotifyLowStockEdge({
                previousQty: 1,
                newQty: 0,
                lowStockThreshold: 2,
            }),
        ).toBe(false);
    });

    it("is false when still above threshold", () => {
        expect(
            shouldNotifyLowStockEdge({
                previousQty: 5,
                newQty: 4,
                lowStockThreshold: 2,
            }),
        ).toBe(false);
    });
});
