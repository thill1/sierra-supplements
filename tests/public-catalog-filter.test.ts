import { describe, expect, it } from "vitest";
import { publicCatalogProductWhere } from "@/lib/store/public-catalog-filter";

describe("publicCatalogProductWhere", () => {
    it("is a drizzle SQL fragment used by store product APIs", () => {
        expect(publicCatalogProductWhere).toBeDefined();
        expect(typeof (publicCatalogProductWhere as { toQuery?: unknown }).toQuery).toBe(
            "function",
        );
    });
});
