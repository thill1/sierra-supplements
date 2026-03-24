import { describe, expect, it } from "vitest";
import { resolveSafeAuthRedirect } from "@/lib/auth-redirect";

describe("resolveSafeAuthRedirect", () => {
    const baseUrl = "https://sierrastrengthsupplements.com";

    it("allows same-origin absolute redirects", () => {
        expect(
            resolveSafeAuthRedirect(
                "https://sierrastrengthsupplements.com/admin/orders",
                baseUrl,
            ),
        ).toBe("https://sierrastrengthsupplements.com/admin/orders");
    });

    it("resolves relative redirects against the configured base URL", () => {
        expect(resolveSafeAuthRedirect("/admin", baseUrl)).toBe(
            "https://sierrastrengthsupplements.com/admin",
        );
    });

    it("falls back to the base URL for cross-origin redirects", () => {
        expect(
            resolveSafeAuthRedirect("https://evil.example/phish", baseUrl),
        ).toBe(baseUrl);
    });
});
