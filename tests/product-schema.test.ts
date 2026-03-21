import { describe, expect, it } from "vitest";
import { productStatusSchema } from "@/lib/admin/schemas/product";

describe("productStatusSchema", () => {
    it("accepts allowed statuses", () => {
        expect(productStatusSchema.safeParse("active").success).toBe(true);
        expect(productStatusSchema.safeParse("draft").success).toBe(true);
    });

    it("rejects unknown status", () => {
        expect(productStatusSchema.safeParse("deleted").success).toBe(false);
    });
});
