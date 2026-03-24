import { describe, expect, it } from "vitest";
import {
    csvRowToCreateInput,
    csvRowToUpdateInput,
    normalizeInventoryCsvHeader,
    parseInventoryCsvText,
    resolveInventoryLookupSlug,
    slugifyProductName,
} from "@/lib/admin/inventory-csv";

describe("slugifyProductName", () => {
    it("lowercases and hyphenates", () => {
        expect(slugifyProductName("  AllMax PB Chocolate  ")).toBe(
            "allmax-pb-chocolate",
        );
    });

    it("trims leading and trailing punctuation", () => {
        expect(slugifyProductName("---hello---")).toBe("hello");
    });
});

describe("resolveInventoryLookupSlug", () => {
    it("prefers explicit slug", () => {
        expect(
            resolveInventoryLookupSlug({
                slug: "custom-slug",
                name: "Other Name",
            }),
        ).toBe("custom-slug");
    });

    it("derives from name when slug absent", () => {
        expect(
            resolveInventoryLookupSlug({
                name: "Pump Sauce Gummy",
            }),
        ).toBe("pump-sauce-gummy");
    });

    it("returns null when neither slug nor name", () => {
        expect(resolveInventoryLookupSlug({})).toBeNull();
    });
});

describe("normalizeInventoryCsvHeader", () => {
    it("lowercases and underscores spaces", () => {
        expect(normalizeInventoryCsvHeader("  Product Name ")).toBe(
            "product_name",
        );
    });
});

describe("parseInventoryCsvText", () => {
    it("parses header aliases into canonical fields", () => {
        const csv = [
            "Product Name,Retail Price,Qty,Description,Category",
            '"Test Item",29.99,5,"A great item",protein',
        ].join("\n");
        const r = parseInventoryCsvText(csv);
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.rows).toHaveLength(1);
        expect(r.rows[0]!.line).toBe(2);
        expect(r.rows[0]!.fields.name).toBe("Test Item");
        expect(r.rows[0]!.fields.price).toBe("29.99");
        expect(r.rows[0]!.fields.stock_quantity).toBe("5");
        expect(r.rows[0]!.fields.description).toBe("A great item");
        expect(r.rows[0]!.fields.category).toBe("protein");
    });

    it("rejects empty file body", () => {
        const r = parseInventoryCsvText("name,price\n");
        expect(r.ok).toBe(false);
    });
});

describe("csvRowToCreateInput", () => {
    it("accepts a valid minimal row with derived slug", () => {
        const r = csvRowToCreateInput({
            name: "Vitamin D",
            description: "Daily D3.",
            price: "12.50",
            category: "vitamins",
        });
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.lookupSlug).toBe("vitamin-d");
        expect(r.data.slug).toBe("vitamin-d");
        expect(r.data.price).toBe(12.5);
        expect(r.data.category).toBe("vitamins");
    });

    it("rejects invalid category", () => {
        const r = csvRowToCreateInput({
            name: "X",
            description: "Y",
            price: "1",
            category: "not-a-real-category",
        });
        expect(r.ok).toBe(false);
    });

    it("rejects invalid stock_quantity when present", () => {
        const r = csvRowToCreateInput({
            name: "X",
            description: "Y",
            price: "1",
            category: "protein",
            stock_quantity: "nope",
        });
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.message).toMatch(/stock_quantity/i);
    });
});

describe("csvRowToUpdateInput", () => {
    it("does not include slug in update payload", () => {
        const r = csvRowToUpdateInput({
            slug: "keep-me",
            name: "Updated",
            description: "New body",
            price: "10",
            category: "creatine",
        });
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.data.slug).toBeUndefined();
        expect(r.data.name).toBe("Updated");
    });
});
