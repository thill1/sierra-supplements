import type { NextRequest } from "next/server";

type AdminToken = {
    isAdmin?: boolean;
} | null;

type AdminMiddlewareInput = {
    pathname: string;
    origin: string;
    href: string;
    token: AdminToken;
};

export type AdminMiddlewareDecision =
    | { type: "allow" }
    | { type: "redirect"; location: string }
    | { type: "json"; status: 401 | 403; body: { error: "Unauthorized" | "Forbidden" } };

export function getSessionCookieName(protocol: string): string {
    return protocol === "https:"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";
}

/**
 * Public URL scheme as seen by the client. On Vercel (and other proxies),
 * `request.nextUrl.protocol` can be `http:` in middleware while the browser
 * uses HTTPS and Auth.js sets `__Secure-authjs.session-token`. Prefer
 * `x-forwarded-proto` so `getToken` uses the correct cookie name and
 * `secureCookie` flag.
 */
export function isPublicRequestHttps(request: NextRequest): boolean {
    const raw = request.headers.get("x-forwarded-proto");
    if (raw) {
        const first = raw.split(",")[0]?.trim().toLowerCase();
        if (first === "https") return true;
        if (first === "http") return false;
    }
    return request.nextUrl.protocol === "https:";
}

export function getAuthSessionCookieOptions(request: NextRequest): {
    cookieName: string;
    secureCookie: boolean;
} {
    const https = isPublicRequestHttps(request);
    return {
        cookieName: getSessionCookieName(https ? "https:" : "http:"),
        secureCookie: https,
    };
}

export function getAdminMiddlewareDecision({
    pathname,
    origin,
    href,
    token,
}: AdminMiddlewareInput): AdminMiddlewareDecision {
    const isLoggedIn = !!token;
    const isAdminUser = token?.isAdmin === true;
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminApiRoute = pathname.startsWith("/api/admin");
    const isAuthRoute =
        pathname.startsWith("/auth") || pathname.startsWith("/api/auth");

    if (isAuthRoute) {
        return { type: "allow" };
    }

    if (isAdminApiRoute) {
        if (!isLoggedIn) {
            return {
                type: "json",
                status: 401,
                body: { error: "Unauthorized" },
            };
        }
        if (!isAdminUser) {
            return {
                type: "json",
                status: 403,
                body: { error: "Forbidden" },
            };
        }
        return { type: "allow" };
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            const signInUrl = new URL("/auth/signin", origin);
            signInUrl.searchParams.set("callbackUrl", href);
            return { type: "redirect", location: signInUrl.toString() };
        }
        if (!isAdminUser) {
            const denied = new URL("/auth/error", origin);
            denied.searchParams.set("error", "AccessDenied");
            return { type: "redirect", location: denied.toString() };
        }
    }

    return { type: "allow" };
}
