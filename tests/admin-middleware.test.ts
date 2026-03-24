import { describe, expect, it } from "vitest";
import {
    getAdminMiddlewareDecision,
    getSessionCookieName,
} from "@/lib/admin-middleware";

describe("getAdminMiddlewareDecision", () => {
    it("redirects unauthenticated admin page requests to sign-in", () => {
        const decision = getAdminMiddlewareDecision({
            pathname: "/admin",
            origin: "https://sierra-supplements.vercel.app",
            href: "https://sierra-supplements.vercel.app/admin",
            token: null,
        });

        expect(decision).toEqual({
            type: "redirect",
            location:
                "https://sierra-supplements.vercel.app/auth/signin?callbackUrl=https%3A%2F%2Fsierra-supplements.vercel.app%2Fadmin",
        });
    });

    it("redirects non-admin admin page requests to AccessDenied", () => {
        const decision = getAdminMiddlewareDecision({
            pathname: "/admin",
            origin: "https://sierra-supplements.vercel.app",
            href: "https://sierra-supplements.vercel.app/admin",
            token: { isAdmin: false },
        });

        expect(decision).toEqual({
            type: "redirect",
            location:
                "https://sierra-supplements.vercel.app/auth/error?error=AccessDenied",
        });
    });

    it("returns a 403 json response for non-admin admin API requests", () => {
        const decision = getAdminMiddlewareDecision({
            pathname: "/api/admin/products",
            origin: "https://sierra-supplements.vercel.app",
            href: "https://sierra-supplements.vercel.app/api/admin/products",
            token: { isAdmin: false },
        });

        expect(decision).toEqual({
            type: "json",
            status: 403,
            body: { error: "Forbidden" },
        });
    });

    it("uses the secure Auth.js session cookie name on https", () => {
        expect(getSessionCookieName("https:")).toBe(
            "__Secure-authjs.session-token",
        );
    });

    it("uses the non-secure Auth.js session cookie name on http", () => {
        expect(getSessionCookieName("http:")).toBe("authjs.session-token");
    });
});
